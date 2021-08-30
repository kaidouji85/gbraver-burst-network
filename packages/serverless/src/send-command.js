// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/websocket-api-event';
import {parseSendCommand} from "./request/sned-command";
import {BattleCommands} from "./dynamo-db/battle-commands";
import {parseJSON} from "./json/parse";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {Notifier} from "./api-gateway/notifier";
import type {AcceptCommand, Error} from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const BATTLE_COMMANDS = process.env.BATTLE_COMMANDS ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const battleCommands = new BattleCommands(dynamoDB, BATTLE_COMMANDS);
const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const invalidRequestBodyError: Error = {action: 'error', error: 'invalid request body'};
const acceptCommand: AcceptCommand = {action: 'accept-command'};

/**
 * Websocket API send-command エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function sendCommand(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseSendCommand(body);
  if (!data) {
    await notifier.notifyToClient(event.requestContext.connectionId, invalidRequestBodyError);
    return {statusCode: 400, body: 'invalid request body'};
  }

  const user = extractUser(event.requestContext.authorizer);
  const command = {userID: user.userID, battleID: data.battleID, flowID: data.flowID, command: data.command};
  await Promise.all([
    battleCommands.put(command),
    notifier.notifyToClient(event.requestContext.connectionId, acceptCommand)
  ]);
  return {statusCode: 200, body: 'send command success'};
}