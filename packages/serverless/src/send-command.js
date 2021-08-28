// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/websocket-api-event';
import {parseSendCommand} from "./lambda/sned-command";
import {BattleCommands} from "./dynamo-db/battle-commands";

const AWS_REGION = process.env.AWS_REGION ?? '';
const BATTLE_COMMAND = process.env.BATTLE_COMMAND ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const battleCommands = new BattleCommands(dynamoDB, BATTLE_COMMAND);

/**
 * Websocket API send-command エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function sendCommand(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const data = parseSendCommand(event.body);
  if (!data) {
    return {statusCode: 400, body: 'invalid request body'};
  }

  const user = extractUser(event.requestContext.authorizer);
  const command = {userID: user.userID, battleID: data.battleID, flowID: data.flowID, command: data.command};
  await battleCommands.put(command);
  return {statusCode: 200, body: 'send command success'};
}