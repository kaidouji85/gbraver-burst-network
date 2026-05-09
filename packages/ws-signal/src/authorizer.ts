import type {
  APIGatewayProxyEventV2,
  APIGatewaySimpleAuthorizerResult,
} from "aws-lambda";
import { extractBearerToken } from "./core/auth-token";

/**
 * HTTP API用のオーソライザー
 * @returns 認証結果
 */
export const authorizer = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewaySimpleAuthorizerResult> => {
  const token = extractBearerToken(event.headers.authorization || "");
  if (token === null) {
    return { isAuthorized: false };
  }
  
  return { isAuthorized: true };
};
