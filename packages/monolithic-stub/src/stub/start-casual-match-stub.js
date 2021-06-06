// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";
import type {UserLogin} from "./user-login";

/** カジュアルマッチスタートのスタブ*/
export class StartCasualMatchStub implements Stub {
  _url: string;
  _user1: UserLogin;

  /**
   * コンストラクタ
   *
   * @param url APIサーバのURL
   * @param user1 ユーザ1 ログイン情報
   */
  constructor(url: string, user1: UserLogin) {
    this._url = url;
    this._user1 = user1;
  }

  /**
   * スタブ名を返す
   *
   * @return スタブ名
   */
  name(): string {
    return 'カジュアルマッチスタートが正しく実行できる';
  }

  /**
   * スタブを実行する
   *
   * @return 実行後に発火するPromise
   */
  async execute(): Promise<void> {
    const browser_1 = new MonolithicBrowser(this._url);
    const isSuccess = await browser_1.login(this._user1.id, this._user1.password);
    if (!isSuccess) {
      return Promise.reject();
    }

    await browser_1.startCasualMatch(ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA);
  }
}