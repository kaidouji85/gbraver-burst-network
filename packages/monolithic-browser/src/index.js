// @flow

import type {IdPasswordLogin} from "@gbraver-burst-network/core";
import type {UserID} from "@gbraver-burst-network/core/lib";

/** モノシリックサーバ ブラウザ用 SDK */
export class MonolithicBrowser implements IdPasswordLogin {
  /**
   * ユーザID、パスワードでログインを行う
   * ログインに成功した場合はtrueを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  login(userID: UserID, password: string): Promise<boolean> {
    // TODO ちゃんと実装する
    console.log(userID, password);
    return Promise.resolve(true);
  }
}