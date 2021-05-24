// @flow

import io from 'socket.io-client';
import type {BattleRoom, CasualMatch, IdPasswordLogin, LoginCheck, UserID} from "@gbraver-burst-network/core";
import {isLogin, login} from "./login";
import type {ArmDozerId, Command, GameState, PilotId, Player} from "gbraver-burst-core";
import {ArmDozerIdList, ArmDozers, PilotIds, Pilots} from "gbraver-burst-core";

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
  startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<BattleRoom> {
    console.log(armdozerId, pilotId);
    return Promise.resolve(emptyBattleRoom());
  }
}

/**
 * 空のバトルルームを生成する
 *
 * @return 生成結果
 */
export function emptyBattleRoom(): BattleRoom {
  const shinBraver = ArmDozers.find(v => v.id === ArmDozerIdList.SHIN_BRAVER)
    ?? ArmDozers[0];
  const neoLandozer = ArmDozers.find(v => v.id === ArmDozerIdList.NEO_LANDOZER)
    ?? ArmDozers[0];
  const shinya = Pilots.find(v => v.id === PilotIds.SHINYA)
    ?? Pilots[0];
  const gai = Pilots.find(v => v.id === PilotIds.GAI)
    ?? Pilots[0];

  const player: Player = {
    playerId: 'player',
    armdozer: shinBraver,
    pilot: shinya
  };
  const enemy: Player = {
    playerId: 'enemy',
    armdozer: neoLandozer,
    pilot: gai
  };

  return {
    player: player,
    enemy: enemy,
    initialState: [],
    progress: (command: Command): Promise<GameState[]> => {
      console.log(command);
      return Promise.resolve([]);
    }
  };
}