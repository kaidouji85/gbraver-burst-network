// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";
import type {UserLogin} from "./user-login";

/** ユーザ1 カジュアルマッチ スタブ */
export class User1CasualMatchStub implements Stub {
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
    return 'ユーザ1 カジュアルマッチ';
  }

  /**
   * スタブを実行する
   *
   * @return 実行後に発火するPromise
   */
  async execute(): Promise<void> {
    const browser = new MonolithicBrowser(this._url);
    const isLoginSuccess = await browser.login(this._user1.id, this._user1.password);
    if (!isLoginSuccess) {
      throw new Error(`${this._user1.id} login failed`);
    }
    await browser.startCasualMatch(ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA);
  }
}