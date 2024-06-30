import { verifyAccessTokenFromCognito } from "./cognito/verify-access-token";
import { AuthorizerEvent } from "./lambda/authorizer-event";
import {
  AuthorizerResponse,
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
  const token = await verifyAccessTokenFromCognito(
    COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID,
    event.queryStringParameters.token,
  );
  const principalId = token.sub ?? "";
  const resource: string = event.methodArn;
  return successAuthorize(principalId, resource);
}
