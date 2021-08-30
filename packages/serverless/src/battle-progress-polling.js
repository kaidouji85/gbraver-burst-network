// @flow

import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import type {WebsocketAPIResponse} from "./lambda/websocket-api-response";
import {parseBattleProgressPolling} from "./lambda/battle-progress-polling";
import {parseJSON} from "./json/parse";
import {createDynamoDBClient} from "./dynamo-db/client";
import {Battles} from "./dynamo-db/battles";
import {extractUser} from "./lambda/websocket-api-event";
import {BattleCommands} from "./dynamo-db/battle-commands";
import type {BattleCommandsSchema} from "./dynamo-db/battle-commands";

const AWS_REGION = process.env.AWS_REGION ?? '';
const BATTLES = process.env.BATTLES ?? '';
const BATTLE_COMMANDS = process.env.BATTLE_COMMANDS ?? '';

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
  console.log('battle is valid', battle);

  const commands = await Promise.all(
    battle.players.map(v => battleCommands.get(v.userID))
  );
  const validCommands = commands.filter(v => v)
    .map(v => ((v: any): BattleCommandsSchema))
    .filter(v => v.flowID === battle.flowID);
  if (validCommands.length !== 2) {
    return invalidRequestBody;
  }
  console.log('commands is valid');
  return {statusCode: 200, body: 'send command success'};
}