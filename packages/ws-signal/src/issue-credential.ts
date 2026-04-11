import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

/**
 * coturn用のクレデンシャルを発行する
 * @param event イベント
 * @returns レスポンス
 */
export const issueCoturnCredential = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 201,
    body: "hello",
  };
};
