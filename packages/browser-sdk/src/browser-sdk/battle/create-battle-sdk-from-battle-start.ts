import {
  ArmdozerId,
  Command,
  GameState,
  PilotId,
  Player,
} from "gbraver-burst-core";
import { filter, fromEvent, map, Observable } from "rxjs";

import { AbortManager } from "../../abort-controller/abort-manager";
import { parseJSON } from "../../json/parse";
import { BattleStart } from "../../response/battle-start";
import { RematchCancelledSchema } from "../../response/rematch-cancelled";
import { parseSuddenlyBattleEnd } from "../../response/suddenly-battle-end";
import { rematchMakingGuest } from "../../websocket/rematch-making-guest";
import { rematchMakingHost } from "../../websocket/rematch-making-host";
import {
  sendCommand,
  sendCommandWithPolling,
} from "../../websocket/send-command";
import { BattleSDK, RematchRoom } from "./battle";

/** バトルSDKの実装 */
class BattleSDKImpl implements BattleSDK {
  /** @override */
  readonly player: Player;
  /** @override */
  readonly enemy: Player;
  /** @override */
  readonly initialState: GameState[];
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** websocket用のAbortManager */
  readonly #websocketAbortManager: AbortManager;
  /** バトルID */
  readonly #battleID: string;
  /** フローID */
  #flowID: string;
  /** ポーリング実行プレイヤーであるか否か、trueでポーリングする */
  readonly #isPoller: boolean;
  /** バトル突然終了通知ストリーム */
  readonly #suddenlyBattleEnd: Observable<unknown>;
  /** 再戦ルーム */
  #rematchRoom: RematchRoom | null;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.player プレイヤー情報
   * @param options.enemy 敵情報
   * @param options.initialState 初期ステート
   * @param options.battleID バトルID
   * @param options.initialFlowID 初期フローID
   * @param options.isPoller ポーリング担当か否か、trueでポーリング担当
   * @param options.websocket websocketクライアント
   */
  constructor(options: {
    player: Player;
    enemy: Player;
    initialState: GameState[];
    battleID: string;
    initialFlowID: string;
    isPoller: boolean;
    websocket: WebSocket;
    websocketAbortManager: AbortManager;
  }) {
    this.player = options.player;
    this.enemy = options.enemy;
    this.initialState = options.initialState;
    this.#websocket = options.websocket;
    this.#battleID = options.battleID;
    this.#flowID = options.initialFlowID;
    this.#isPoller = options.isPoller;
    this.#suddenlyBattleEnd = fromEvent(this.#websocket, "message").pipe(
      map((e) => e as MessageEvent),
      map((e) => parseJSON(e.data)),
      filter((data) => data),
      map((data) => parseSuddenlyBattleEnd(data)),
      filter((sudenlyBattleEnd) => !!sudenlyBattleEnd),
    );
    this.#rematchRoom = null;
    this.#websocketAbortManager = options.websocketAbortManager;
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const result = this.#isPoller
      ? await sendCommandWithPolling(
          this.#websocket,
          this.#battleID,
          this.#flowID,
          command,
          { signal },
        )
      : await sendCommand(
          this.#websocket,
          this.#battleID,
          this.#flowID,
          command,
          { signal },
        );
    if (result.action === "battle-progressed") {
      this.#flowID = result.flowID;
    } else if (result.action === "battle-end") {
      const options = {
        websocket: this.#websocket,
        websocketAbortManager: this.#websocketAbortManager,
        roomID: result.rematchRoomID,
      };
      this.#rematchRoom = result.isHost
        ? new RematchRoomHost(options)
        : new RematchRoomGuest(options);
    }

    return result.update;
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return this.#suddenlyBattleEnd;
  }

  /** @override */
  getRematchRoom(): RematchRoom | null {
    return this.#rematchRoom;
  }
}

/**
 * 再戦キャンセル通知ストリームを生成する
 * @param websocket websocketコネクション
 * @returns 生成結果
 */
const createRematchCancelledNotifier = (
  websocket: WebSocket,
): Observable<unknown> => {
  return fromEvent(websocket, "message").pipe(
    map((e) => e as MessageEvent),
    map((e) => parseJSON(e.data)),
    filter((data) => data),
    map((data) => RematchCancelledSchema.safeParse(data)),
    map((result) => (result.success ? result.data : null)),
    filter((rematchCancelled) => !!rematchCancelled),
  );
};

/** 再戦ルーム（ゲスト側） */
class RematchRoomGuest implements RematchRoom {
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** websocket用のAbortManager */
  readonly #websocketAbortManager: AbortManager;
  /** 再戦がキャンセルされたことを通知するストリーム */
  readonly rematchCancelled: Observable<unknown>;
  /** 再戦ルームID */
  readonly #roomID: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.websocket WebSocketクライアント
   * @param options.websocketAbortManager websocket用のAbortManager
   * @param options.roomID 再戦ルームID
   */
  constructor(options: {
    websocket: WebSocket;
    websocketAbortManager: AbortManager;
    roomID: string;
  }) {
    this.#websocket = options.websocket;
    this.#websocketAbortManager = options.websocketAbortManager;
    this.rematchCancelled = createRematchCancelledNotifier(this.#websocket);
    this.#roomID = options.roomID;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleSDK> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const battleStart = await rematchMakingGuest({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
      signal,
    });
    return createBattleSDKFromBattleStart(
      battleStart,
      this.#websocket,
      this.#websocketAbortManager,
    );
  }

  /** @override */
  rematchCancelledNotifier(): Observable<unknown> {
    return this.rematchCancelled;
  }
}

/** 再戦ルーム（ホスト側） */
class RematchRoomHost implements RematchRoom {
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** websocket用のAbortManager */
  readonly #websocketAbortManager: AbortManager;
  /** 再戦がキャンセルされたことを通知するストリーム */
  readonly rematchCancelled: Observable<unknown>;
  /** 再戦ルームID */
  readonly #roomID: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.websocket WebSocketクライアント
   * @param options.websocketAbortManager websocket用のAbortManager
   * @param options.roomID 再戦ルームID
   */
  constructor(options: {
    websocket: WebSocket;
    websocketAbortManager: AbortManager;
    roomID: string;
  }) {
    this.#websocket = options.websocket;
    this.#websocketAbortManager = options.websocketAbortManager;
    this.rematchCancelled = createRematchCancelledNotifier(this.#websocket);
    this.#roomID = options.roomID;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleSDK> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const battleStart = await rematchMakingHost({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
      signal,
    });
    return createBattleSDKFromBattleStart(
      battleStart,
      this.#websocket,
      this.#websocketAbortManager,
    );
  }
  /** @override */
  rematchCancelledNotifier(): Observable<unknown> {
    return this.rematchCancelled;
  }
}

/**
 * BattleStartからBattleSDKを生成する
 * @param battleStart BattleStartのデータ
 * @param websocket websocketクライアント
 * @param websocketAbortManager websocket用のAbortManager
 * @returns 生成結果
 */
export function createBattleSDKFromBattleStart(
  battleStart: BattleStart,
  websocket: WebSocket,
  websocketAbortManager: AbortManager,
): BattleSDK {
  return new BattleSDKImpl({
    player: battleStart.player,
    enemy: battleStart.enemy,
    initialState: battleStart.stateHistory,
    battleID: battleStart.battleID,
    initialFlowID: battleStart.flowID,
    isPoller: battleStart.isPoller,
    websocket,
    websocketAbortManager,
  });
}
