import { verifyAccessToken } from "./auth0/access-token";
import type { AuthorizerEvent } from "./lambda/authorizer-event";
import type { AuthorizerResponse } from "./lambda/authorizer-response";
import { successAuthorize } from "./lambda/authorizer-response";

/** cognito JWKSのURL */
const COGNITO_JWKS_URL = process.env.COGNITO_JWKS_URL ?? "";

/** cognito Audience */
const COGNITO_AUDIENCE = process.env.COGNITO_AUDIENCE ?? "";

/**
 * オーサライザ
 *
 * @param event イベント
 * @returns 認可結果
 */
export async function authorizer(
  event: AuthorizerEvent,
): Promise<AuthorizerResponse> {
  const token = await verifyAccessToken(
    event.queryStringParameters.token,
    COGNITO_JWKS_URL,
    COGNITO_AUDIENCE,
  );
  const principalId = token.sub ?? "";
  const resource: string = event.methodArn;
  return successAuthorize(principalId, resource);
}
