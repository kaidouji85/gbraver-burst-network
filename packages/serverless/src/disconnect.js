// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import type {GbraverBurstConnectionsSchema} from "./dynamo-db/gbraver-burst-connections";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";

const AWS_REGION = process.env.AWS_REGION ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);

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