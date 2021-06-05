// @flow

import type {Session} from "./session";
import type {User} from "../user";
import {v4 as uuidv4} from 'uuid';

/**
 * ユーザ情報からセッションを生成する
 *
 * @param user ユーザ情報
 * @return セッション情報
 */
export function createSessionFromUser(user: User): Session {
  return {
    id: uuidv4(),
    auth: {type: 'UserAuth', user}
  };
}