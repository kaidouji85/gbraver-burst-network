import type { Battle } from "@gbraver-burst-network/browser-core";
import type { Command, GameState, Player } from "gbraver-burst-core";
import { filter, fromEvent, map, Observable } from "rxjs";

import { parseJSON } from "../json/parse";
import type { SuddenlyBattleEnd } from "../response/suddenly-battle-end";
import { parseSuddenlyBattleEnd } from "../response/suddenly-battle-end";
import { sendCommand, sendCommandWithPolling } from "../websocket/send-command";

/** コンストラクタのパラメータ */
type Param = {
  /** プレイヤー情報 */
  player: Player;

  /** 敵情報 */
  enemy: Player;

  /** 初期ステート */
  initialState: GameState[];

  /** バトルID */
  battleID: string;

  /** 初期フローID */
  initialFlowID: string;

  /** ポーリング担当か否か、trueでポーリング担当 */
  isPoller: boolean;

  /** websocketクライアント */
  websocket: WebSocket;
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
  _suddenlyBattleEnd: Observable<void>;

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
      map(e => e as MessageEvent),
      map((e) => parseJSON(e.data)), 
      filter((data) => data), 
      map((data: Record<string, any>) => parseSuddenlyBattleEnd(data)), 
      filter((sudenlyBattleEnd) => !!sudenlyBattleEnd),
      map(v => {})
    );
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const result = this._isPoller ? await sendCommandWithPolling(this._websocket, this._battleID, this._flowID, command) : await sendCommand(this._websocket, this._battleID, this._flowID, command);

    if (result.action === "battle-progressed") {
      this._flowID = result.flowID;
    }

    return result.update;
  }

  /** @override */
  suddenlyBattleNotifier(): Observable<void> {
    return this._suddenlyBattleEnd;
  }

}