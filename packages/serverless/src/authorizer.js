// @flow

import type {AuthorizerResponse} from "./lambda/authorizer-response";
import {successAuthorize} from "./lambda/authorizer-response";
import {verifyAccessToken} from "./auth0/access-token";
import type {AuthorizerEvent} from "./lambda/authorizer-event";

/** auth0 JWKS URL */
const AUTH0_JWKS_URL = process.env.AUTH0_JWKS_URL || '';
/** auth0 audience */
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

/**
 * オーサライザ
 *
 * @param event イベント
 * @return 認可結果
 */
export async function authorizer(event: AuthorizerEvent): Promise<AuthorizerResponse> {
  const token = await verifyAccessToken(event.queryStringParameters.token, AUTH0_JWKS_URL, AUTH0_AUDIENCE);
  const principalId = token.sub;
  const resource: string = event.methodArn;
  return successAuthorize(principalId, resource);
}