import { createDynamoRematchEntries } from "./dynamo-db/create-dynamo-rematch-entries";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** サービス名 */
const SERVICE = process.env.SERVICE ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** WebSocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

/** DynamoDBドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** rematch-entries テーブル DAO */
const dynamoRematchEntries = createDynamoRematchEntries(
  dynamoDB,
  SERVICE,
  STAGE,
);

/**
 * 再戦にエントリする
 * @param event イベント
 * @returns レスポンス
 */
export const enterRematch = async (
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> => {
  return {
    statusCode: 200,
    body: "enter rematch room",
  };
};
