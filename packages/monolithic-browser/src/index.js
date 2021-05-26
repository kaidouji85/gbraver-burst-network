// @flow

import io from 'socket.io-client';
import type {BattleRoom, CasualMatch, IdPasswordLogin, LoginCheck, UserID} from "@gbraver-burst-network/core";
import {isLogin, login} from "./login";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";
import {emptyBattleRoom} from "./empty-battle-room";
import {socketIoConnection} from "./socket-io-connection";

/** モノシリックサーバ ブラウザ用 SDK */
export class MonolithicBrowser implements IdPasswordLogin, LoginCheck, CasualMatch {
  _apiServerURL: string
  _accessToken: string;
  _socket: typeof io.Socket | null;

  /**
   * コンストラクタ
   *
   * @param apiServerURL APIサーバURL
   */
  constructor(apiServerURL: string) {
    this._apiServerURL = apiServerURL;
    this._accessToken = '';
    this._socket = null;
  }

  /**
   * ユーザID、パスワードでログインを行う
   * ログインに成功した場合はtrueを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  async login(userID: UserID, password: string): Promise<boolean> {
    const result = await login(userID, password, this._apiServerURL);
    if (!result.isSuccess) {
      return false;
    }

    this._accessToken = result.accessToken;
    return true;
  }

  /**
   * ログインチェックを行う
   * ログイン済の場合はtrueを返す
   *
   * @return 判定結果
   */
  isLogin(): Promise<boolean> {
    return isLogin(this._accessToken, this._apiServerURL);
  }

  /**
   * カジュアルマッチをスタートさせる
   *
   * @param armdozerId 選択したアームドーザID
   * @param pilotId 選択したパイロットID
   * @return バトルルーム準備
   */
  async startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<BattleRoom> {
    const socket = await socketIoConnection(this._apiServerURL, this._accessToken);
    console.log(armdozerId, pilotId, socket);
    return emptyBattleRoom();
  }
}
