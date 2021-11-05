// @flow


import type {RestAPIResponse} from "./lambda/rest-api-response";
import type {RestAPIEvent} from "./lambda/rest-api-event";

/**
 * アカウント削除API
 *
 * @param event イベント
 * @return レスポンス
 */
export async function deleteAccount(event: RestAPIEvent): Promise<RestAPIResponse> {
  console.log(event);
  return {
    statusCode: 200,
    body: 'delete user success',
  };
}