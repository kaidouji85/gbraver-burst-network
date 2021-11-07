// @flow


import type {RestAPIResponse} from "./lambda/rest-api-response";
import type {RestAPIEvent} from "./lambda/rest-api-event";
import {extractUserFromRestAPIJWT} from "./lambda/extract-user";
import {deleteUser} from "./auth0/delete-user";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? '';
const AUTH0_USER_MANAGEMENT_APP_CLIENT_ID = process.env.AUTH0_USER_MANAGEMENT_APP_CLIENT_ID ?? '';
const AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET = process.env.AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET ?? '';

/**
 * アカウント削除API
 *
 * @param event イベント
 * @return レスポンス
 */
export async function deleteAccount(event: RestAPIEvent): Promise<RestAPIResponse> {
  const user = extractUserFromRestAPIJWT(event.requestContext.authorizer.jwt.claims);
  // auth0ユーザ削除関数にGブレイバーバーストのユーザIDを指定しているが、
  // 現状ではauth0、GブレイバーバーストのユーザIDは完全一致するので問題ない
  await deleteUser(AUTH0_DOMAIN, AUTH0_USER_MANAGEMENT_APP_CLIENT_ID,
    AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET, user.userID);
  return {
    statusCode: 200,
    body: 'delete account success',
  };
}