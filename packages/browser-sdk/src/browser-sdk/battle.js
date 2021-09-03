// @flow

import type {Player, GameState, Command} from "gbraver-burst-core";
import type {Battle} from '@gbraver-burst-network/core';

/** バトルSDK */
export class BasttleSDK implements Battle {
  /** @override */
  player: Player;
  /** @override */
  enemy: Player;
  /** @override */
  initialState: GameState[];
  
  _websocket: WebSocket;

  /**
   * コンストラクタ
   * 
   * @param player プレイヤー情報 
   * @param enemy 敵情報
   * @param initailState 初期ステートヒストリー
   * @param websocket WebSocketクライアント
   */
  constructor(player: Player, enemy: Player, initailState: GameState[], websocket: WebSocket) {
    this.player = player;
    this.enemy = enemy;
    this.initialState = initailState;
    this._websocket = websocket;
  }
  
  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    console.log(command);
    return [];
  }
}