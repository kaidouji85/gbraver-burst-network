import { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * coturnクレデンシャル発行成功レスポンスを生成する
 * @param username ユーザー名
 * @param password パスワード
 * @returns coturnクレデンシャル発行成功レスポンス
 */
export const createIssueCoturnCredentialSuccessResponse = (
  username: string,
  password: string,
): APIGatewayProxyResultV2 => {
  return {
    statusCode: 201,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  };
};