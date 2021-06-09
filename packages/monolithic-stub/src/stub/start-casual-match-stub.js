// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";
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
    await Promise.all([
      this._start(this._user1, ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA),
      this._start(this._user2, ArmDozerIdList.NEO_LANDOZER, PilotIds.GAI)
    ]);
  }

  /**
   * カジュアルマッチを開始するヘルパー関数
   *
   * @param user ログインユーザ情報
   * @param armdozerId 選択するアームドーザのID
   * @param pilotId 選択するパイロットのID
   * @return マッチング完了したら発火するPromise
   */
  async _start(user: UserLogin, armdozerId: ArmDozerId, pilotId: PilotId): Promise<void> {
    const browser = new MonolithicBrowser(this._url);
    const isLoginSuccess = await browser.login(user.id, user.password);
    if (!isLoginSuccess) {
      throw new Error(`${user.id} login failed`);
    }
    await browser.startCasualMatch(armdozerId, pilotId);
  }
}