// auth0 v3.3.0の不具合で、ES Moduleとしてimportすることができない
// 回避策として同パッケージのcommonJSであるauth0/src/index.jsをrequireしている
/* eslint-disable @typescript-eslint/no-var-requires */
const { ManagementClient } = require("auth0/src/index.js");
/* eslint-enable */

import { extractUserFromRestAPIJWT } from "./lambda/extract-user";
import type { RestAPIEvent } from "./lambda/rest-api-event";
import type { RestAPIResponse } from "./lambda/rest-api-response";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? "";
const AUTH0_USER_MANAGEMENT_APP_CLIENT_ID =
  process.env.AUTH0_USER_MANAGEMENT_APP_CLIENT_ID ?? "";
const AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET =
  process.env.AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET ?? "";
const auth0ManagementClient = new ManagementClient({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_USER_MANAGEMENT_APP_CLIENT_ID,
  clientSecret: AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET,
  scope: "delete:users",
});

/**
 * ユーザ削除API
 *
 * @param event イベント
 * @return レスポンス
 */
export async function deleteUser(
  event: RestAPIEvent
): Promise<RestAPIResponse> {
  const user = extractUserFromRestAPIJWT(
    event.requestContext.authorizer.jwt.claims
  );
  // auth0ユーザ削除関数にGブレイバーバーストのユーザIDを指定しているが、
  // 現状ではauth0、GブレイバーバーストのユーザIDは完全一致するので問題ない
  await auth0ManagementClient.deleteUser({
    id: user.userID,
  });
  return {
    statusCode: 200,
    body: "delete user success",
  };
}
