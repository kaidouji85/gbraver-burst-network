// @flow

import type {Player, GameState, Command} from 'gbraver-burst-core';
import type {Battle, BattleRoomID} from '@gbraver-burst-network/core';
import {battleRoom} from '../socket.io/battle-room';
import {SocketConnection} from '../socket.io/socket-connection';

/** コンストラクタのパラメータ */
type Param = {
  apiServerURL: string, 
  socket: SocketConnection,
  battleRoomID: BattleRoomID,
  player: Player,
  enemy: Player,
  initialState: GameState[],
};

/** バトル ブラウザ実装 */
export class BrowserBattle implements Battle {
  player: Player;
  enemy: Player;
  initialState: GameState[];
  _apiServerURL: string;
  _socket: SocketConnection;
  _battleRoomID: BattleRoomID;

  /**
   * コンストラクタ
   * 本コンストラクタに渡すsocketは正しいアクセストークンがセットされているものと見なす
   * 
   * @param apiServerURL APIサーバのURL
   * @param socket ソケット
   */
  constructor(param: Param) {
    this.player = param.player;
    this.enemy = param.enemy;
    this.initialState = param.initialState;
    this._apiServerURL = param.apiServerURL;
    this._socket = param.socket;
    this._battleRoomID = param.battleRoomID;
  }

  /**
   * バトルを進行させる
   *
   * @param command プレイヤーが入力するコマンド
   * @return ゲーム結果
   */
  async progress(command: Command): Promise<GameState[]> {
    const progress = await this._socket.execute(v => battleRoom(v, this._battleRoomID, command))
    return progress.update;
  }

  /**
   * APIサーバとの接続を切る
   */
   close(): void {
    this._socket.close();
  }
}