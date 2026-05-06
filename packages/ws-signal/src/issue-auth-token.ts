import { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * 認証トークンを発行する
 * @returns HTTPレスポンス
 */
export const issueAuthToken = async (): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 201,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ token: "dummy-token" }),
  };
};
