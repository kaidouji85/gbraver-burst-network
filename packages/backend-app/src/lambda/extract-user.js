// @flow

import type {Authorizer} from "./websocket-api-event";
import type {User} from '../core/user';

/**
 * 認可情報からユーザ情報を抽出する
 * 
 * @param authorizer 抽出元となる認可情報
 * @return 抽出したユーザ情報
 */
 export function extractUser(authorizer: Authorizer): User {
  return {userID: authorizer.principalId};
}