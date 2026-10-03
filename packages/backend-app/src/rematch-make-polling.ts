import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoRematchEntries } from "./dynamo-db/create-dynamo-rematch-entries";
import { createDynamoRematchRooms } from "./dynamo-db/create-dynamo-rematch-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { RematchMakePollingSchema } from "./request/rematch-make-polling";
import { COULD_NOT_REMATCH_MAKE } from "./response/cloud-not-rematch-make";
import { Error } from "./response/error";

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

/** 無効なリクエストボディ */
const invalidRequestBody: WebsocketAPIResponse = {
  statusCode: 400,
  body: "invalid request body",
};

/** 無効なリクエストボディのエラー */
const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};

/**
 * 再戦マッチメークポーリング
 * @param event イベント
 * @returns レスポンス
 */
export const rematchMakePolling = async (
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> => {
  const body = parseJSON(event.body);
  const { connectionId } = event.requestContext;
  const data = RematchMakePollingSchema.safeParse(body);
  if (!data.success) {
    await notifier.notifyToClient(connectionId, invalidRequestBodyError);
    return invalidRequestBody;
  }

  const { roomID } = data.data;
  if (roomID === "") {
    await notifier.notifyToClient(connectionId, invalidRequestBodyError);
    return invalidRequestBody;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const room = await dynamoRematchRooms.get(roomID);
  if (!room) {
    await notifier.notifyToClient(connectionId, COULD_NOT_REMATCH_MAKE);
    return invalidRequestBody;
  }

  const isRoomHost = room.hostUserID === user.userID;
  if (!isRoomHost) {
    await notifier.notifyToClient(connectionId, COULD_NOT_REMATCH_MAKE);
    return invalidRequestBody;
  }

  const entries = await dynamoRematchEntries.getEntries(roomID);

  return {
    statusCode: 200,
    body: "end rematch make polling",
  };
};
