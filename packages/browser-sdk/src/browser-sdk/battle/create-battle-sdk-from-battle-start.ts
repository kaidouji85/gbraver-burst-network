import {
  ArmdozerId,
  Command,
  GameState,
  PilotId,
  Player,
} from "gbraver-burst-core";
import { filter, fromEvent, map, Observable } from "rxjs";

import { parseJSON } from "../../json/parse";
import { BattleStart } from "../../response/battle-start";
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
    } else if (result.action === "battle-end") {
      const options = {
        websocket: this.#websocket,
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

/** 再戦ルーム（ゲスト側） */
class RematchRoomGuest implements RematchRoom {
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** 再戦ルームID */
  readonly #roomID: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.websocket WebSocketクライアント
   * @param options.roomID 再戦ルームID
   */
  constructor(options: { websocket: WebSocket; roomID: string }) {
    this.#websocket = options.websocket;
    this.#roomID = options.roomID;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleSDK> {
    const battleStart = await rematchMakingGuest({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
    });
    return createBattleSDKFromBattleStart(battleStart, this.#websocket);
  }
}

/** 再戦ルーム（ホスト側） */
class RematchRoomHost implements RematchRoom {
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** 再戦ルームID */
  readonly #roomID: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.websocket WebSocketクライアント
   * @param options.roomID 再戦ルームID
   */
  constructor(options: { websocket: WebSocket; roomID: string }) {
    this.#websocket = options.websocket;
    this.#roomID = options.roomID;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleSDK> {
    const battleStart = await rematchMakingHost({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
    });
    return createBattleSDKFromBattleStart(battleStart, this.#websocket);
  }
}

/**
 * BattleStartからBattleSDKを生成する
 * @param battleStart BattleStartのデータ
 * @param websocket websocketクライアント
 * @returns 生成結果
 */
export function createBattleSDKFromBattleStart(
  battleStart: BattleStart,
  websocket: WebSocket,
): BattleSDK {
  return new BattleSDKImpl({
    player: battleStart.player,
    enemy: battleStart.enemy,
    initialState: battleStart.stateHistory,
    battleID: battleStart.battleID,
    initialFlowID: battleStart.flowID,
    isPoller: battleStart.isPoller,
    websocket,
  });
}
