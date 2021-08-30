// @flow

import {v4 as uuidv4} from 'uuid';
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import type {WebsocketAPIResponse} from "./lambda/websocket-api-response";
import {parseBattleProgressPolling} from "./lambda/battle-progress-polling";
import {parseJSON} from "./json/parse";
import {createDynamoDBClient} from "./dynamo-db/client";
import {Battles} from "./dynamo-db/battles";
import {extractUser} from "./lambda/websocket-api-event";
import {BattleCommands} from "./dynamo-db/battle-commands";
import type {BattleCommandsSchema} from "./dynamo-db/battle-commands";
import {restoreGbraverBurst} from "gbraver-burst-core";
import {toPlayer} from "./dto/battle";
import type {FlowID} from "./dto/battle";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {Notifier} from "./api-gateway/notifier";

/** バトル進行通知 */
type BattleProgressed = {
  action: 'battle-progressed',
  /** 発行されたフローID */
  flowID: FlowID,
  /** 更新されたゲームステート */
  update: GameState[],
};

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
    return invalidRequestBody;
  }

  const battle = await battles.get(data.battleID);
  if (!battle) {
    return invalidRequestBody;
  }

  const user = extractUser(event.requestContext.authorizer);
  const isIncludedPlayer = battle.players.map(v => v.userID)
    .includes(user.userID);
  const isValidFlowID = data.flowID === battle.flowID;
  if (!isIncludedPlayer || !isValidFlowID) {
    return invalidRequestBody;
  }

  const commands = await Promise.all(
    battle.players.map(v => battleCommands.get(v.userID))
  );
  const validCommands = commands.filter(v => v)
    .map(v => ((v: any): BattleCommandsSchema))
    .filter(v => v.flowID === battle.flowID);
  if (validCommands.length !== 2) {
    return invalidRequestBody;
  }

  const upcastedPlayers = battle.players.map(v => toPlayer(v));
  const corePlayers = [upcastedPlayers[0], upcastedPlayers[1]];
  const playerCommands = validCommands.map(command => {
    const target = battle.players.find(v => v.userID === command.userID) ?? battle.players[0];
    return {playerId: target.playerId, command: command.command};
  });
  const coreCommands = [playerCommands[0], playerCommands[1]];
  const core = restoreGbraverBurst({players: corePlayers, stateHistory: battle.stateHistory});
  const updatedState = core.progress(coreCommands);
  const updatedBattle = {...battle, flowID: uuidv4(), stateHistory: core.stateHistory()};
  const notices = battle.players.map(v => {
    const data: BattleProgressed = {action: 'battle-progressed', flowID: updatedBattle.flowID, update: updatedState};
    return {connectionID: v.connectionId, data};
  });

  await Promise.all([
    ...notices.map(v => notifier.notifyToClient(v.connectionID, v.data)),
    battles.put(updatedBattle)
  ])

  return {statusCode: 200, body: 'send command success'};
}