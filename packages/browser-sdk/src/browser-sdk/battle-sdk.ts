import { Command, GameState, Player } from "gbraver-burst-core";
import { filter, fromEvent, map, Observable } from "rxjs";

import { parseJSON } from "../json/parse";
import { parseSuddenlyBattleEnd } from "../response/suddenly-battle-end";
import { sendCommand, sendCommandWithPolling } from "../websocket/send-command";
import { Battle } from "./battle";

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
  readonly player: Player;
  /** @override */
  readonly enemy: Player;
  /** @override */
  readonly initialState: GameState[];
  /** WebSocket接続 */
  readonly #websocket: WebSocket;
  /** バトルID */
  readonly #battleID: string;
  /** フローID */
  #flowID: string;
  /** ポーリング実行プレイヤーであるか否か、trueでポーリングする */
  readonly #isPoller: boolean;
  /** バトル突然終了通知ストリーム */
  readonly #suddenlyBattleEnd: Observable<unknown>;

  /**
   * コンストラクタ
   *
   * @param param パラメータ
   */
  constructor(param: Param) {
    this.player = param.player;
    this.enemy = param.enemy;
    this.initialState = param.initialState;
    this.#websocket = param.websocket;
    this.#battleID = param.battleID;
    this.#flowID = param.initialFlowID;
    this.#isPoller = param.isPoller;
    this.#suddenlyBattleEnd = fromEvent(this.#websocket, "message").pipe(
      map((e) => e as MessageEvent),
      map((e) => parseJSON(e.data)),
      filter((data) => data),
      map((data) => parseSuddenlyBattleEnd(data)),
      filter((sudenlyBattleEnd) => !!sudenlyBattleEnd),
    );
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const result = this.#isPoller
      ? await sendCommandWithPolling(
          this.#websocket,
          this.#battleID,
          this.#flowID,
          command,
        )
      : await sendCommand(
          this.#websocket,
          this.#battleID,
          this.#flowID,
          command,
        );

    if (result.action === "battle-progressed") {
      this.#flowID = result.flowID;
    }

    return result.update;
  }

  /** @override */
  suddenlyBattleNotifier(): Observable<unknown> {
    return this.#suddenlyBattleEnd;
  }
}
