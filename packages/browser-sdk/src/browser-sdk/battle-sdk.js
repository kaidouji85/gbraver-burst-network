// @flow

import type { Player, GameState, Command } from "gbraver-burst-core";
import type { Battle } from "@gbraver-burst-network/browser-core";
import { sendCommand, sendCommandWithPolling } from "../websocket/send-command";
import { Observable, fromEvent, map, filter } from "rxjs";
import { parseJSON } from "../json/parse";
import { parseSuddenlyBattleEnd } from "../response/suddenly-battle-end";
import type { SuddenlyBattleEnd } from "../response/suddenly-battle-end";

/** コンストラクタのパラメータ */
type Param = {
  /** プレイヤー情報 */
  player: Player,
  /** 敵情報 */
  enemy: Player,
  /** 初期ステート */
  initialState: GameState[],
  /** バトルID */
  battleID: string,
  /** 初期フローID */
  initialFlowID: string,
  /** ポーリング担当か否か、trueでポーリング担当 */
  isPoller: boolean,
  /** websocketクライアント */
  websocket: WebSocket,
};

/** バトルSDK */
export class BattleSDK implements Battle {
  /** @override */
  player: Player;
  /** @override */
  enemy: Player;
  /** @override */
  initialState: GameState[];

  _websocket: WebSocket;
  _battleID: string;
  _flowID: string;
  _isPoller: boolean;
  _suddenlyBattleEnd: typeof Observable;

  /**
   * コンストラクタ
   *
   * @param param パラメータ
   */
  constructor(param: Param) {
    this.player = param.player;
    this.enemy = param.enemy;
    this.initialState = param.initialState;
    this._websocket = param.websocket;
    this._battleID = param.battleID;
    this._flowID = param.initialFlowID;
    this._isPoller = param.isPoller;
    this._suddenlyBattleEnd = fromEvent(this._websocket, "message").pipe(
      map((e: MessageEvent) => parseJSON(e.data)),
      filter((data: ?Object) => data),
      map((data: Object) => parseSuddenlyBattleEnd(data)),
      filter((sudenlyBattleEnd: ?SuddenlyBattleEnd) => sudenlyBattleEnd)
    );
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const result = this._isPoller
      ? await sendCommandWithPolling(
          this._websocket,
          this._battleID,
          this._flowID,
          command
        )
      : await sendCommand(
          this._websocket,
          this._battleID,
          this._flowID,
          command
        );
    if (result.action === "battle-progressed") {
      this._flowID = result.flowID;
    }
    return result.update;
  }

  /** @override */
  suddenlyBattleNotifier(): typeof Observable {
    return this._suddenlyBattleEnd;
  }
}
