import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";

import { verifyAccessTokenFromCognito } from "./cognito/verify-access-token";
import { AuthorizerEvent } from "./lambda/authorizer-event";
import {
  AuthorizerResponse,
  failedAuthorize,
  successAuthorize,
} from "./lambda/authorizer-response";

/** cognito ユーザープールID */
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID ?? "";

/** cognito クライアントID */
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";

/**
 * オーサライザ
 * @param event イベント
 * @returns 認可結果
 */
export async function authorizer(
  event: AuthorizerEvent,
): Promise<AuthorizerResponse> {
  const resource = event.methodArn;
  let token: CognitoAccessTokenPayload;
  try {
    token = await verifyAccessTokenFromCognito(
      COGNITO_USER_POOL_ID,
      COGNITO_CLIENT_ID,
      event.queryStringParameters.token,
    );
  } catch (error) {
    console.error("Failed to verify access token", error);
    return failedAuthorize("unauthorized", resource);
  }

  const principalId = token.sub;
  return successAuthorize(principalId, resource);
}
