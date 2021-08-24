// @flow

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
import type {GbraverBurstConnection} from "./dynamo-db/gbraver-burst-connections";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';
const AUTH0_JWKS_URL = process.env.AUTH0_JWKS_URL ?? '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);

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
  const connection = {connectionId: event.requestContext.connectionId, user, state};
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
async function cleanUp(connection: GbraverBurstConnection): Promise<void> {
  if (connection.state.type === 'CasualMatchMaking') {
    await casualMatchEntries.delete(connection.user.userID);
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
  const respData = JSON.stringify(data);
  await apiGateway
    .postToConnection({ConnectionId: event.requestContext.connectionId, Data: respData})
    .promise();
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
    connectionID: event.requestContext.connectionId};
  const state = {type: 'CasualMatchMaking'};
  const updatedConnection = {connectionId: event.requestContext.connectionId, user, state};
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
  const deleteKeys = matchingList
    .flat()
    .map(v => v.userID);
  const notices = matchingList.map(matching => matching.map(v => apiGateway.postToConnection({
    ConnectionId: v.connectionID,
    Data: JSON.stringify({action: 'matching', matching})
  })))
    .flat()
    .map(v => v.promise());
  await Promise.all([
    ...notices,
    casualMatchEntries.batchDelete(deleteKeys)
  ]);
}