import { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * シグナリングチャネルを削除する
 * @returns レスポンス
 */
export const deleteSignalingChannel =
  async (): Promise<APIGatewayProxyResultV2> => {
    return { statusCode: 200, body: "delete signaling channel success" };
  };
