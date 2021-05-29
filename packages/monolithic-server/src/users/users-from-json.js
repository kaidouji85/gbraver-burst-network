// @flow

import type {User, UserID} from "@gbraver-burst-network/core";
import {createHash} from 'crypto';
import type {PasswordUserFinder} from "./password-user-finder";

/** JSONに定義されているユーザ情報 */
type UserFromJSON = {
  /** ユーザID */
  userID: string,
  /** sha256エンコードされたパスワード */
  password: string,
};

/** users.jsonから生成したユーザ達 */
export class UsersFromJSON implements PasswordUserFinder {
  _users: UserFromJSON[];

  /** コンストラクタ */
  constructor() {
    this._users = require('../../users.json');
  }

  /**
   * 指定したユーザ情報を検索する
   * 存在しない場合はnullを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return 検索結果
   */
  findUser(userID: UserID, password: string): ?User {
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex');
    const target = this._users.find(v => (v.userID === userID) && (v.password === hashedPassword));
    return target ? {id: target.userID} : null;
  }
}