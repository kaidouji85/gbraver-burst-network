// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";
import type {UserLogin} from "./user-login";

/** カジュアルマッチスタートのスタブ*/
export class StartCasualMatchStub implements Stub {
  _url: string;
  _user1: UserLogin;
  _user2: UserLogin;

  /**
   * コンストラクタ
   *
   * @param url APIサーバのURL
   * @param user1 ユーザ1 ログイン情報
   * @param user2 ユーザ2 ログイン情報
   */
  constructor(url: string, user1: UserLogin, user2: UserLogin) {
    this._url = url;
    this._user1 = user1;
    this._user2 = user2;
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
    const browser1 = new MonolithicBrowser(this._url);
    const browser2 = new MonolithicBrowser(this._url);
    const isUser1Success = await browser1.login(this._user1.id, this._user1.password);
    const isUser2Success = await browser2.login(this._user2.id, this._user2.password);
    if (!isUser1Success || !isUser2Success) {
      return Promise.reject();
    }

    // TODO 最初にログインしたプレイヤーもマッチング通知をするように改良する
    browser1.startCasualMatch(ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA);
    await browser2.startCasualMatch(ArmDozerIdList.NEO_LANDOZER, PilotIds.GAI);
  }
}