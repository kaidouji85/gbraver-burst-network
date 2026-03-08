import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

/**
 * Websocket API create-room エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function createRoom(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  return { statusCode: 200, body: "create-room success" };
}
