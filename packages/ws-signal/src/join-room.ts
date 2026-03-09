import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

/**
 * ゲストが入室する
 * @param event イベント
 * @returns レスポンス
 */
export async function joinRoom(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  return { statusCode: 200, body: "join room success" };
}
