// @flow

import type {User, UserID} from "@gbraver-burst-network/core";
import {Schema, model} from 'mongoose';
import type {PasswordUserFinder} from "./password-user-finder";
import {createHash} from 'crypto';

/** mongodb ユーザスキーマ */
const UserSchema = new Schema({
  userID: String,
  password: String,
});

/** mongodb ユーザモデル */
const UserModel = model('users', UserSchema);

/** mongodbから取得したユーザ */
export const UsersFromMongo: PasswordUserFinder = {
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
    const result = await UserModel.find({userID, password: hashedPassword}).exec();
    return result.length === 1 ? result[0] : null;
  }
}