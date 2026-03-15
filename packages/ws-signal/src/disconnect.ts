import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** DynamoDB connections テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";
/** DynamoDB rooms テーブル名 */
const DYNAMODB_ROOMS_TABLE = process.env.DYNAMODB_ROOMS_TABLE ?? "";

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB DAO connections */
const dynamoConnections = new DynamoConnections(
  dynamoDB,
  DYNAMODB_CONNECTIONS_TABLE,
);
/** DynamoDB DAO rooms */
const dynamoRooms = new DynamoRooms(dynamoDB, DYNAMODB_ROOMS_TABLE);

/**
 * Websocket API $disconnect エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function disconnect(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const { connectionId } = event.requestContext;
  const deletedConnection = await dynamoConnections.delete(connectionId);
  if (!deletedConnection) {
    return { statusCode: 404, body: "connection not found." };
  }

  if (deletedConnection.state.type === "room-host") {
    const { roomID } = deletedConnection.state;
    await dynamoRooms.forceDelete(roomID);
  }
  return { statusCode: 200, body: "disconnected." };
}
