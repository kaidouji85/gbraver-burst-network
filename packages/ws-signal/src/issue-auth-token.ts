import { APIGatewayProxyResultV2 } from "aws-lambda";

import { createAuthToken } from "./core/auth-token";

/**
 * 認証トークンを発行する
 * @returns HTTPレスポンス
 */
export const issueAuthToken = async (): Promise<APIGatewayProxyResultV2> => {
  const authToken = createAuthToken();
  return {
    statusCode: 201,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(authToken),
  };
};
