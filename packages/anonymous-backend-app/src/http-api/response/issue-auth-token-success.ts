import { APIGatewayProxyResultV2 } from "aws-lambda";

import { AuthToken } from "../../core/auth-token";

/**
 * 認証トークン発行成功レスポンスを生成する
 * @param authToken 認証トークン
 * @returns 証トークン発行成功レスポンス
 */
export const createIssueAuthTokenSuccessResponse = (
  authToken: AuthToken,
): APIGatewayProxyResultV2 => {
  return {
    statusCode: 201,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(authToken),
  };
};
