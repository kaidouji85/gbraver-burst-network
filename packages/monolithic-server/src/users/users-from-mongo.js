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

/** mongodbユーザのデータ型 */
type MongoUser = {
  userID: string,
  password: string,
};

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
    if (result.length !== 1) {
      return null;
    }

    const mongoUser = (result[0]: MongoUser);
    return {id: mongoUser.userID};
  }
}