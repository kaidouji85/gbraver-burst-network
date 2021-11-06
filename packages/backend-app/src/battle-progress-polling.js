// @flow

import {v4 as uuidv4} from 'uuid';
import {uniq} from "ramda";
import {restoreGbraverBurst} from "gbraver-burst-core";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUserFromWSAuthorizer} from "./lambda/extract-user";
import type {WebsocketAPIResponse} from "./lambda/websocket-api-response";
import {parseBattleProgressPolling} from "./request/battle-progress-polling";
import {parseJSON} from "./json/parse";
import {createDynamoDBClient} from "./dynamo-db/client";
import type {BattleCommandsSchema} from "./dynamo-db/battle-commands";
import {toPlayer} from "./core/battle";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {Notifier} from "./api-gateway/notifier";
import type {BattleEnd, BattleProgressed, NotReadyBattleProgress, Error} from "./response/websocket-response";
import {createBattleCommands, createBattles, createConnections} from "./dynamo-db/dao-creator";

const AWS_REGION = process.env.AWS_REGION ?? '';
const SERVICE = process.env.SERVICE ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const battles = createBattles(dynamoDB, SERVICE, STAGE);
const battleCommands = createBattleCommands(dynamoDB, SERVICE, STAGE);
const invalidRequestBody = {statusCode: 400, body: 'invalid request body'};
const invalidRequestError: Error = {action: 'error', error: 'invalid request body'};
const notReadyBattleProgress: NotReadyBattleProgress = {action: 'not-ready-battle-progress'};

/**
 * バトル更新用のポーリング
 * プレイヤーのコマンドが揃っている場合はバトルを進め、
 * そうでない場合は何もしない
 *
 * @param event イベント
 * @return 本関数が終了したら発火するPromise
 */
export async function battleProgressPolling(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseBattleProgressPolling(body);
  if (!data) {
    await notifier.notifyToClient(event.requestContext.connectionId, invalidRequestError);
    return invalidRequestBody;
  }

  const battle = await battles.get(data.battleID);
  if (!battle) {
    await notifier.notifyToClient(event.requestContext.connectionId, notReadyBattleProgress);
    return invalidRequestBody;
  }

  const fetchedCommands = await Promise.all([
    battleCommands.get(battle.players[0].userID),
    battleCommands.get(battle.players[1].userID),
  ]);
  if (!fetchedCommands[0] || !fetchedCommands[1]) {
    await notifier.notifyToClient(event.requestContext.connectionId, notReadyBattleProgress);
    return invalidRequestBody;
  }

  const command0: BattleCommandsSchema = fetchedCommands[0];
  const command1: BattleCommandsSchema = fetchedCommands[1];
  const playerOfCommand0 = battle.players.find(v => v.userID === command0.userID);
  const playerOfCommand1 = battle.players.find(v => v.userID === command1.userID);
  const isSameBattleIDs = isSameValues([data.battleID, battle.battleID, command0.battleID, command0.battleID]);
  const isSameFlowIDs = isSameValues([data.flowID, battle.flowID, command0.flowID, command1.flowID])
  const user = extractUserFromWSAuthorizer(event.requestContext.authorizer);
  const isPoller = user.userID === battle.poller;
  if (!isSameBattleIDs || !isSameFlowIDs || !isPoller || !playerOfCommand0 || !playerOfCommand1) {
    await notifier.notifyToClient(event.requestContext.connectionId, notReadyBattleProgress);
    return invalidRequestBody;
  }

  const corePlayers = [toPlayer(battle.players[0]), toPlayer(battle.players[1])];
  const coreCommands = [
    {command: command0.command, playerId: playerOfCommand0.playerId},
    {command: command1.command, playerId: playerOfCommand1.playerId}];
  const core = restoreGbraverBurst({players: corePlayers, stateHistory: battle.stateHistory});
  const update = core.progress(coreCommands);

  const onGameEnd = () => {
    const noticedData: BattleEnd = {action: 'battle-end', update};
    const updatedConnectionState = {type: 'None'};
    return Promise.all([
      ...battle.players.map(v => notifier.notifyToClient(v.connectionId, noticedData)),
      ...battle.players.map(v => connections.put({connectionId: v.connectionId, userID: v.userID,
        state: updatedConnectionState})),
      battles.delete(battle.battleID)
    ]);
  };

  const onGameContinue = () => {
    const flowID = uuidv4();
    const noticedData: BattleProgressed = {action: 'battle-progressed', flowID, update};
    return Promise.all([
      ...battle.players.map(v => notifier.notifyToClient(v.connectionId, noticedData)),
      battles.put({...battle, flowID, stateHistory: core.stateHistory()})
    ]);
  };

  const lastState = update[update.length - 1];
  const isGameEnd = lastState.effect.name === 'GameEnd';
  await (isGameEnd ? onGameEnd() : onGameContinue());
  return {statusCode: 200, body: 'send command success'};
}

/**
 * 指定した文字列が全て同じ値か否かを判定するヘルパー関数
 *
 * @param values 判定対象の文字列を配列で渡す
 * @return 判定結果、trueで全て同じ値である
 */
function isSameValues(values: string[]): boolean {
  return uniq(values).length === 1;
}
