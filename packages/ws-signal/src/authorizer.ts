import type {
  APIGatewayProxyEventV2,
  APIGatewaySimpleAuthorizerResult,
} from "aws-lambda";

/**
 * HTTP API用のオーソライザー
 * @returns 認証結果
 */
export const authorizer = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewaySimpleAuthorizerResult> => {
  //event.headers.authorization;
  return { isAuthorized: true };
};
