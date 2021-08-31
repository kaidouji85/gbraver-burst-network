// @flow

import {v4 as uuidv4} from 'uuid';
import {uniq} from "ramda";
import {restoreGbraverBurst} from "gbraver-burst-core";
import type {PlayerCommand} from "gbraver-burst-core";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from "./lambda/websocket-api-event";
import type {WebsocketAPIResponse} from "./lambda/websocket-api-response";
import {parseBattleProgressPolling} from "./request/battle-progress-polling";
import {parseJSON} from "./json/parse";
import {createDynamoDBClient} from "./dynamo-db/client";
import {Battles} from "./dynamo-db/battles";
import type {BattleCommandsSchema} from "./dynamo-db/battle-commands";
import {BattleCommands} from "./dynamo-db/battle-commands";
import {toPlayer} from "./dto/battle";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {Notifier} from "./api-gateway/notifier";
import type {BattleEnd, BattleProgressed, NotReadyBattleProgress, Error} from "./response/websocket-response";
import type {PlayerSchema} from "./dynamo-db/battles";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";
import type {FlowID} from "./dto/battle";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const BATTLES = process.env.BATTLES ?? '';
const BATTLE_COMMANDS = process.env.BATTLE_COMMANDS ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const battles = new Battles(dynamoDB, BATTLES);
const battleCommands = new BattleCommands(dynamoDB, BATTLE_COMMANDS);
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

  const commands: [BattleCommandsSchema, BattleCommandsSchema] = [fetchedCommands[0], fetchedCommands[1]];
  const user = extractUser(event.requestContext.authorizer);
  const isSameBattleID = isAllSameValue([data.battleID, battle.battleID, commands[0].battleID, commands[1].battleID]);
  const isSameFlowID = isAllSameValue([data.flowID, battle.flowID, commands[0].flowID, commands[1].flowID])
  const isPoller = user.userID === battle.poller;
  if (!isSameBattleID || !isSameFlowID || !isPoller) {
    await notifier.notifyToClient(event.requestContext.connectionId, notReadyBattleProgress);
    return invalidRequestBody;
  }

  const corePlayers = [toPlayer(battle.players[0]), toPlayer(battle.players[1])];
  const coreCommands = [createPlayerCommand(commands[0], battle.players), createPlayerCommand(commands[1], battle.players)]
  const core = restoreGbraverBurst({players: corePlayers, stateHistory: battle.stateHistory});
  const update = core.progress(coreCommands);
  const lastState = update[update.length - 1];
  const isGameEnd = lastState.effect.name === 'GameEnd';
  const flowID = uuidv4();
  const noticedData = isGameEnd ? createBattleEnd(update) : createBattleProgress(flowID, update);
  const notices = battle.players.map(v => ({connectionId: v.connectionId, data: noticedData}));
  await Promise.all([
    ...notices.map(v => notifier.notifyToClient(v.connectionId, v.data)),
    isGameEnd ? battles.delete(battle.battleID) : battles.put({...battle, flowID, update})
  ])
  return {statusCode: 200, body: 'send command success'};
}

/**
 * プレイヤーコマンドを生成するヘルパー関数
 *
 * @param command コマンド
 * @param players ゲーム参加プレイヤー
 * @return 生成結果
 */
function createPlayerCommand(command: BattleCommandsSchema, players: [PlayerSchema, PlayerSchema]): PlayerCommand {
  const player = players.find(v => v.userID === command.userID) ?? players[0];
  return {playerId: player.playerId, command: command.command};
}

/**
 * 指定した文字列が全て同じ値か否かを判定するヘルパー関数
 *
 * @param values 判定対象の文字列を配列で渡す
 * @return 判定結果、trueで全て同じ値である
 */
function isAllSameValue(values: string[]): boolean {
  return uniq(values).length === 1;
}

/**
 * BattleProgressedを生成するヘルパー関数
 *
 * @param flowID フローID
 * @param update 更新されたステート
 * @return 生成結果
 */
function createBattleProgress(flowID: FlowID, update: GameState[]): BattleProgressed {
  return {action: 'battle-progressed', flowID, update};
}

/**
 * BattleEndを生成するヘルパー関数
 *
 * @param update 更新されたステート
 * @return 生成結果
 */
function createBattleEnd(update: GameState[]): BattleEnd {
  return {action: 'battle-end', update};
}