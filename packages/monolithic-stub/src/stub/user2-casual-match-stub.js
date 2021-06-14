// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";
import type {UserLogin} from "./user-login";

/** ユーザ2 カジュアルマッチ スタブ */
export class User2CasualMatchStub implements Stub {
  _url: string;
  _user2: UserLogin;

  /**
   * コンストラクタ
   *
   * @param url APIサーバのURL
   * @param user2 ユーザ2 ログイン情報
   */
  constructor(url: string, user2: UserLogin) {
    this._url = url;
    this._user2 = user2;
  }

  /**
   * スタブ名を返す
   *
   * @return スタブ名
   */
  name(): string {
    return 'ユーザ2 カジュアルマッチ';
  }

  /**
   * スタブを実行する
   *
   * @return 実行後に発火するPromise
   */
  async execute(): Promise<void> {
    const browser = new MonolithicBrowser(this._url);
    const isLoginSuccess = await browser.login(this._user2.id, this._user2.password);
    if (!isLoginSuccess) {
      throw new Error(`${this._user2.id} login failed`);
    }

    const battle = await browser.startCasualMatch(ArmDozerIdList.NEO_LANDOZER, PilotIds.GAI);
    console.log(`${this._user2.id}'s battle`, battle);
    const command = {type: 'BATTERY_COMMAND', battery: 0};
    const update = await battle.progress(command);
    console.log(`${this._user2.id}'s update`, update);
  }
}