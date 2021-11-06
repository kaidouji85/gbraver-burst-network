// @flow


import type {RestAPIResponse} from "./lambda/rest-api-response";
import type {RestAPIEvent} from "./lambda/rest-api-event";
import {extractUserFromRestAPIJWT} from "./lambda/extract-user";

/**
 * アカウント削除API
 *
 * @param event イベント
 * @return レスポンス
 */
export async function deleteAccount(event: RestAPIEvent): Promise<RestAPIResponse> {
  const user = extractUserFromRestAPIJWT(event.requestContext.authorizer.jwt.claims);
  console.log(user);
  return {
    statusCode: 200,
    body: 'delete user success',
  };
}