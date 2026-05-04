import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createPrivateMatchRoomExpiresAt } from "./core/create-private-match-room-expires-at";
import { generatePrivateMatchRoomID } from "./core/generate-private-match-room-id";
import { PrivateMatchRoom } from "./core/private-match-room";
import { User } from "./core/user";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import {
  CreatePrivateMatchRoom,
  parseCreatePrivateMatchRoom,
} from "./request/create-private-match-room";
import { Error } from "./response/error";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** サービス名 */
const SERVICE = process.env.SERVICE ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** WebSocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
/** ルーム作成リトライ回数 */
const MAX_ROOM_CREATION_RETRY = 5;

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB 接続情報 */
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
/** DynamoDB プライベートマッチルーム情報 */
const dynamoPrivateMatchRooms = createDynamoPrivateMatchRooms(
  dynamoDB,
  SERVICE,
  STAGE,
);

/** API Gateway エンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** API Gateway 管理オブジェクト */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** WebSocket用メッセージ通知オブジェクト */
const notifier = new Notifier(apiGateway);

/** レスポンス（不正なリクエストボディ） */
const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};

/**
 * リトライありでルーム生成をする
 * @param options ルーム生成オプション
 * @param options.connectionId コネクションID
 * @param options.data リクエストボディ
 * @param options.user ユーザー情報
 * @returns 生成できた場合はルーム情報、生成できなかった場合はnull
 */
async function createRoomWithRetry(options: {
  connectionId: string;
  data: CreatePrivateMatchRoom;
  user: User;
}): Promise<PrivateMatchRoom | null> {
  const { connectionId: ownerConnectionId, data, user } = options;
  const { armdozerId, pilotId } = data;
  const { userID: owner } = user;
  for (let i = 0; i < MAX_ROOM_CREATION_RETRY; i++) {
    const room: PrivateMatchRoom = {
      roomID: generatePrivateMatchRoomID(),
      expiresAt: createPrivateMatchRoomExpiresAt(),
      owner,
      ownerConnectionId,
      armdozerId,
      pilotId,
    };
    const isRoomCreationSuccessful = await dynamoPrivateMatchRooms.put(room);
    if (isRoomCreationSuccessful) {
      return room;
    }
  }
  return null;
}

/**
 * Websocket API createPrivateMatchRoom エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function createPrivateMatchRoom(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseCreatePrivateMatchRoom(body);
  const { connectionId } = event.requestContext;
  if (!data) {
    await notifier.notifyToClient(connectionId, invalidRequestBodyError);
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const room = await createRoomWithRetry({ connectionId, data, user });
  if (!room) {
    await notifier.notifyToClient(connectionId, {
      action: "error",
      error: "create private match room failed",
    });
    return {
      statusCode: 200,
      body: "create private match room failed",
    };
  }

  const { roomID } = room;
  await Promise.all([
    dynamoConnections.put({
      connectionId,
      userID: user.userID,
      state: { type: "HoldPrivateMatch", roomID },
    }),
    notifier.notifyToClient(connectionId, {
      action: "created-private-match-room",
      roomID,
    }),
  ]);

  return {
    statusCode: 200,
    body: "create private match room",
  };
}
