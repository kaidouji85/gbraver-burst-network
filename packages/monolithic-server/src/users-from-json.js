// @flow

import type {User, UserID} from "@gbraver-burst-network/core";
import {createHash} from 'crypto';

/** JSONに定義されているユーザ情報 */
type UserFromJSON = {
  /** ユーザID */
  userID: string,
  /** sha256エンコードされたパスワード */
  password: string,
};

/** users.jsonから生成したユーザ達 */
export class UsersFromJSON {
  _users: UserFromJSON[];
  _hash: crypto$Hash;

  /** コンストラクタ */
  constructor() {
    this._users = require('../users.json');
    this._hash = createHash('sha256');
  }

  /**
   * 指定したユーザ情報を検索する
   * 存在しない場合はnullを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return 検索結果
   */
  find(userID: UserID, password: string): ?User {
    const hashedPassword = this._hash.update(password);
    const target = this._users.find(v => (v.userID === userID) && (v.password === hashedPassword));
    return target ? {id: target.userID} : null;
  }
}