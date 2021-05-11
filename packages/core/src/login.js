// @flow

import type {UserID} from "./user";
import type {GBraverBurstNetwork} from "./gbraver-burst-network";

/**
 * ID、パスワードでのログイン
 */
export interface IdPasswordLogin {
  /**
   * ユーザID、パスワードでログインを行う
   * ID、パスワードの組み合わせが間違っている場合はnullを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  login(userID: UserID, password: string): Promise<?GBraverBurstNetwork>;
}