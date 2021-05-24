// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import type {UserID} from "@gbraver-burst-network/core";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";

/** カジュアルマッチスタートのスタブ*/
export class StartCasualMatchStub implements Stub {
  _url: string;
  _userID: string;
  _password: string;

  /**
   * コンストラクタ
   *
   * @param url APIサーバのURL
   * @param userID ユーザID
   * @param password パスワード
   */
  constructor(url: string, userID: UserID, password: string) {
    this._url = url;
    this._userID = userID;
    this._password = password;
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
    const browser = new MonolithicBrowser(this._url);
    const isSuccess = await browser.login(this._userID, this._password);
    if (!isSuccess) {
      return Promise.reject();
    }

    await browser.startCasualMatch(ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA);
  }
}