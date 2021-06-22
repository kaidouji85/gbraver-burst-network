// @flow

import type {User, UserID} from "@gbraver-burst-network/core";

/** ID、パスワードでのユーザ検索 */
export interface PasswordUserFinder {
  /**
   * 指定したユーザ情報を検索する
   * 存在しない場合はnullを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return 検索結果
   */
  findUser(userID: UserID, password: string): Promise<?User>;
}