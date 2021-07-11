// @flow

import {promises as fs} from 'fs';
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
  _jsonFilePath: string;
  _users: ?UserFromJSON[];

  /**
   * コンストラクタ
   *
   * @param jsonFilePath JSONファイルのパス
   */
  constructor(jsonFilePath: string) {
    this._jsonFilePath = jsonFilePath;
  }

  /**
   * 指定したユーザ情報を検索する
   * 存在しない場合はnullを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return 検索結果
   */
  async findUser(userID: UserID, password: string): Promise<?User> {
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex');
    const users = this._users ?? await this._loadUsers();
    const target = users.find(v => (v.userID === userID) && (v.password === hashedPassword));
    return target ? {id: target.userID} : null;
  }

  /**
   * JSONファイルからユーザ情報を読み込む
   *
   * @return ユーザ情報
   */
  async _loadUsers(): Promise<UserFromJSON[]> {
    const content = await fs.readFile(this._jsonFilePath, 'utf8');
    return JSON.parse(content);
  }
}