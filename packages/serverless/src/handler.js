// @flow

import {v4 as uuidv4} from 'uuid';
import {ArmDozers, Pilots, startGbraverBurst} from "gbraver-burst-core";
import type {Player} from 'gbraver-burst-core';
import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/websocket-api-event';
import {parseEnterCasualMatch} from "./lambda/enter-casual-match";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";
import type {AuthorizerEvent} from "./lambda/authorizer-event";
import type {AuthorizerResponse} from "./lambda/authorizer-response";
import {successAuthorize} from "./lambda/authorizer-response";
import {verifyAccessToken} from "./auth0/access-token";
import {matchMake} from "./match-make/match-make";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {parseJSON} from "./json/parse";
import type {GbraverBurstConnectionsSchema} from "./dynamo-db/gbraver-burst-connections";
import {Notifier} from "./api-gateway/notifier";
import {Battles} from "./dynamo-db/battles";
import type {BattlePlayer} from "./dto/battle";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';
const BATTLES = process.env.BATTLES ?? '';
const AUTH0_JWKS_URL = process.env.AUTH0_JWKS_URL ?? '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);
const battles = new Battles(dynamoDB, BATTLES);

/**
 * オーサライザ
 *
 * @param event イベント
 * @return 認可結果
 */
export async function authorizer(event: AuthorizerEvent): Promise<AuthorizerResponse> {
  const token = await verifyAccessToken(event.queryStringParameters.token, AUTH0_JWKS_URL, AUTH0_AUDIENCE);
  const principalId = token.sub;
  const resource: string = event.methodArn;
  return successAuthorize(principalId, resource);
}

/**
 * Websocket API $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const user = extractUser(event.requestContext.authorizer);
  const state = {type: 'None'};
  const connection = {connectionId: event.requestContext.connectionId, userID: user.userID, state};
  await connections.put(connection);
  return {statusCode: 200, body: 'connected.'};
}

/**
 * Websocket API $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const connectionId = event.requestContext.connectionId;
  const connection = await connections.get(connectionId);
  await Promise.all([
    connections.delete(connectionId),
    connection ? cleanUp(connection) : Promise.resolve()
  ]);
  return {statusCode: 200, body: 'disconnected'};
}

/**
 * Websocket切断時のクリーンアップを行う
 *
 * @param connection 接続情報
 * @return クリーンアップ完了時に発火するPromise
 */
async function cleanUp(connection: GbraverBurstConnectionsSchema): Promise<void> {
  if (connection.state.type === 'CasualMatchMaking') {
    await casualMatchEntries.delete(connection.userID);
  }
}

/**
 * Websocket API ping エントリポイント
 * 
 * @param event イベント
 * @return レスポンス
 */
export async function ping(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const data = {'action': 'ping', 'message': 'welcome to gbraver burst serverless'};
  await notifier.notifyToClient(event.requestContext.connectionId, data);
  return {statusCode: 200, body: 'ping success'};
}

/**
 * Websocket API enterCasualMatch エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function enterCasualMatch(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseEnterCasualMatch(body);
  if (!data) {
    return {statusCode: 400, body: 'invalid request body'}
  }

  const user = extractUser(event.requestContext.authorizer);
  const entry = {userID: user.userID, armdozerId: data.armdozerId, pilotId: data.pilotId,
    connectionId: event.requestContext.connectionId};
  const state = {type: 'CasualMatchMaking'};
  const updatedConnection = {connectionId: event.requestContext.connectionId, 
    userID: user.userID, state};
  await Promise.all([
    casualMatchEntries.put(entry),
    connections.put(updatedConnection)
  ]);
  return {statusCode: 200, body: 'enter casual match success'};
}

/**
 * カジュアルマッチエントリテーブルをポーリングする
 *
 * @return 処理完了後に発火するPromise
 */
export async function pollingCasualMatchEntries(): Promise<void> {
  const entries = await casualMatchEntries.scan();
  const matchingList = matchMake(entries);
  const startBattles = matchingList.map(async (matching): Promise<void> => {
    const playerList = matching.map(entry => {
      const armdozer = ArmDozers.find(v => v.id === entry.armdozerId) ?? ArmDozers[0];
      const pilot = Pilots.find(v => v.id === entry.pilotId) ?? Pilots[0];
      return {playerId: uuidv4(), userID: entry.userID, armdozer, pilot};
    });
    const players = [playerList[0], playerList[1]];
    const core = startGbraverBurst(players);
    const battle = {battleID: uuidv4(), flowID: uuidv4(), stateHistory: core.stateHistory(), players};
    const updatedConnections = matching.map(v => {
      const state = {type: 'InBattle', battleID: battle.battleID};
      return {connectionId: v.connectionId, userID: v.userID, state};
    });
    const notices = matching.map(entry => {
      const player = players.find(v => v.userID === entry.userID) ?? players[0];
      const respPlayer = toPlayer(player);
      const enemy = players.find(v => v.userID !== entry.userID) ?? players[0];
      const respEnemy = toPlayer(enemy);
      const data = {player: respPlayer, enemy: respEnemy, battleID: battle.battleID, flowID: battle.flowID};
      console.log(entry);
      console.log(data);
      return {connectionId: entry.connectionId, data};
    });
    const deleteEntryIDs = matching.map(v => v.userID);
    await Promise.all([
      battles.put(battle),
      ...updatedConnections.map(v => connections.put(v)),
      ...deleteEntryIDs.map(v => casualMatchEntries.delete(v)),
      ...notices.map(v => notifier.notifyToClient(v.connectionId, v.data))
    ]);
  });
  await Promise.all(startBattles);
}

function toPlayer(origin: BattlePlayer): Player {
  return {playerId: origin.playerId, armdozer: origin.armdozer, pilot: origin.pilot};
}