import { AuthorizerEvent } from "./lambda-authorizer/authorizer-event";
import { successAuthorize } from "./lambda-authorizer/authorizer-response";

/**
 * WebSocket 用のオーサライザ
 * @param event イベント
 * @returns 認証結果
 */
export const wsAuthorizer = async (event: AuthorizerEvent) => {
  const resource = event.methodArn;
  return successAuthorize("user", resource);
};
