import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoRematchEntries } from "./dynamo-db/create-dynamo-rematch-entries";
import { createDynamoRematchRooms } from "./dynamo-db/create-dynamo-rematch-rooms";
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

/** DynamoDBDocument */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** rematch-rooms テーブル DAO */
const dynamoRematchRooms = createDynamoRematchRooms(dynamoDB, SERVICE, STAGE);
/** rematch-entries テーブル DAO */
const dynamoRematchEntries = createDynamoRematchEntries(
  dynamoDB,
  SERVICE,
  STAGE,
);
/** battles テーブル DAO */
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
/** connections テーブル DAO */
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);

/** API Gatewayエンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** API Gateway Management API */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** 通知オブジェクト */
const notifier = new Notifier(apiGateway);

/**
 * 再戦マッチメークポーリング
 * @param event イベント
 * @returns レスポンス
 */
export const rematchMakePolling = async (
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> => {
  return {
    statusCode: 200,
    body: "end rematch make polling",
  };
};
