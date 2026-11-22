import { Command, GameState, Player } from "gbraver-burst-core";
import { from, mergeMap, Observable, Subject, take, takeUntil } from "rxjs";

import { AbortManager } from "../../abort-controller/abort-manager";
import { sendGuestMessage } from "../../webrtc/guest/guest-message";
import { receiveBattleUpdate } from "../../webrtc/guest/receive-battle-update";
import { notifyConnectionFailed } from "../../webrtc/notify-connection-failed";
import {
  AnonymousBattleSDK,
  AnonymousRematchRoom,
} from "../anonymous-battle-sdk";
import { GuestWebRTCConnectionManager } from "./guest-webrtc-connection-manager";

/** ゲスト側バトルSDK */
export class GuestBattleSDK implements AnonymousBattleSDK {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];
  /** 最新のフローID */
  flowID: string;
  /** ホストのWebRTCコネクションマネージャー */
  #webRTCConnection: GuestWebRTCConnectionManager;
  /** dataChannel.sendの例外通知ストリーム */
  #sendExceptionSubject: Subject<unknown> = new Subject<unknown>();
  /** アボート管理オブジェクト */
  #abortManager: AbortManager;
  /** 再戦ルーム、バトルが終了したらセットされる */
  #rematchRoom: AnonymousRematchRoom | null = null;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostPlayer ホスト側のプレイヤー情報
   * @param options.guestPlayer ゲスト側のプレイヤー情報
   * @param options.initialState ゲームの初期状態
   * @param options.initialFlowID 初期のフローID
   * @param options.webRTCConnection ホストのWebRTCコネクションマネージャー
   * @param options.abortManager アボート管理オブジェクト
   */
  constructor(options: {
    hostPlayer: Player;
    guestPlayer: Player;
    initialState: GameState[];
    initialFlowID: string;
    webRTCConnection: GuestWebRTCConnectionManager;
    abortManager: AbortManager;
  }) {
    this.player = options.guestPlayer;
    this.enemy = options.hostPlayer;
    this.initialState = options.initialState;
    this.flowID = options.initialFlowID;
    this.#webRTCConnection = options.webRTCConnection;
    this.#abortManager = options.abortManager;
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const { signal } = this.#abortManager.getAbortController();
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }

    const dataChannel = await this.#webRTCConnection.getOrCreateConnection({
      signal,
    }).dataChannelPromise;
    const battleUpdatePromise = receiveBattleUpdate({
      dataChannel,
      signal,
    });
    try {
      sendGuestMessage(dataChannel, {
        type: "send-command",
        flowID: this.flowID,
        command,
      });
    } catch (error) {
      this.#sendExceptionSubject.next(error);
      throw error;
    }
    const battleUpdate = await battleUpdatePromise;
    if (battleUpdate.type === "battle-progressed") {
      this.flowID = battleUpdate.flowID;
    }
    return battleUpdate.update;
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return from(
      this.#webRTCConnection.getOrCreateConnection().connectionPromise,
    ).pipe(
      mergeMap((connection) => notifyConnectionFailed(connection)),
      takeUntil(this.#sendExceptionSubject),
      take(1),
    );
  }

  /** @override */
  getRematchRoom(): AnonymousRematchRoom | null {
    return this.#rematchRoom;
  }
}
