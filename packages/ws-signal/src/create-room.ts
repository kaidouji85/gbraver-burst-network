import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { CreateRoomSchema } from "./request/create-room";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRoomsDAO } from "./dynamo-db/dynamo-room";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** DynamoDB room テーブル名 */
const DYNAMODB_ROOM_TABLE = process.env.DYNAMODB_ROOM_TABLE ?? "";

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB room DAO */
const dynamoRooms = new DynamoRoomsDAO(dynamoDB, DYNAMODB_ROOM_TABLE);

/**
 * Websocket API create-room エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function createRoom(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const parsedBody = JSON.parse(event.body || "");
  const createRoom = CreateRoomSchema.safeParse(parsedBody);
  if (!createRoom.success) {
    return { statusCode: 400, body: "invalid request" };
  }

  const roomID = "あおえいさ"; // ルームIDの生成ロジックは後で実装する
  const { sdp, iceCandidates } = createRoom.data;
  dynamoRooms.put({ roomID, hostSignal: { sdp, iceCandidates } });
  return { statusCode: 200, body: "create-room success" };
}
