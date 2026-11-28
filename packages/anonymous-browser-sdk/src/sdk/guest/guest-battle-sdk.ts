import {
  ArmdozerId,
  Command,
  GameState,
  PilotId,
  Player,
} from "gbraver-burst-core";
import {
  from,
  mergeMap,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  take,
  takeUntil,
} from "rxjs";

import { SignalContainer } from "../../abort-controller/signal-container";
import { sendGuestMessage } from "../../webrtc/guest/guest-message";
import { notifyHostRematchCancel } from "../../webrtc/guest/notify-host-rematch-cancel";
import { receiveBattleStart } from "../../webrtc/guest/receive-battle-start";
import { receiveBattleUpdate } from "../../webrtc/guest/receive-battle-update";
import { HostCancelRematch } from "../../webrtc/host/host-message";
import { notifyIceConnectionDisconnected } from "../../webrtc/notify-ice-connection-disconnected";
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
  readonly #webRTCConnection: GuestWebRTCConnectionManager;
  /** dataChannel.sendの例外通知ストリーム */
  readonly #sendExceptionSubject: Subject<unknown> = new Subject<unknown>();
  /** アボートシグナル */
  #signal: AbortSignal;
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
   * @param options.signal アボートシグナル
   */
  constructor(
    options: {
      hostPlayer: Player;
      guestPlayer: Player;
      initialState: GameState[];
      initialFlowID: string;
      webRTCConnection: GuestWebRTCConnectionManager;
    } & SignalContainer,
  ) {
    this.player = options.guestPlayer;
    this.enemy = options.hostPlayer;
    this.initialState = options.initialState;
    this.flowID = options.initialFlowID;
    this.#webRTCConnection = options.webRTCConnection;
    this.#signal = options.signal;
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const dataChannel = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    }).dataChannelPromise;
    const battleUpdatePromise = receiveBattleUpdate({
      dataChannel,
      signal: this.#signal,
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
    } else if (battleUpdate.type === "battle-end") {
      const { rematchRoomID } = battleUpdate;
      const hostRematchCancelNotifier = notifyHostRematchCancel({
        rematchRoomID,
        dataChannel,
      });
      this.#rematchRoom = new GuestRematchRoom({
        rematchRoomID,
        webRTCConnection: this.#webRTCConnection,
        hostRematchCancelNotifier,
        signal: this.#signal,
      });
    }

    return battleUpdate.update;
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return from(
      this.#webRTCConnection.getOrCreateConnection().connectionPromise,
    ).pipe(
      mergeMap((connection) => notifyIceConnectionDisconnected(connection)),
      takeUntil(this.#sendExceptionSubject),
      take(1),
    );
  }

  /** @override */
  getRematchRoom(): AnonymousRematchRoom | null {
    return this.#rematchRoom;
  }
}

/** ゲスト側再戦ルーム */
class GuestRematchRoom implements AnonymousRematchRoom {
  /** 再戦ルームID */
  readonly rematchRoomID: string;
  /** ホスト側のWebRTCコネクションマネージャー */
  readonly #webRTCConnection: GuestWebRTCConnectionManager;
  /** アボートシグナル */
  readonly #signal: AbortSignal;
  /** ホストからの再戦キャンセル通知 */
  readonly #hostRematchCancelNotifier: ReplaySubject<HostCancelRematch> =
    new ReplaySubject<HostCancelRematch>(1);
  readonly #unsubscribe: Subscription;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.rematchRoomID 再戦ルームID
   * @param options.webRTCConnection ゲスト側のWebRTCコネクションマネージャー
   * @param options.hostRematchCancelNotifier ホストからの再戦キャンセル通知
   */
  constructor(
    options: {
      rematchRoomID: string;
      webRTCConnection: GuestWebRTCConnectionManager;
      hostRematchCancelNotifier: Observable<HostCancelRematch>;
    } & SignalContainer,
  ) {
    this.rematchRoomID = options.rematchRoomID;
    this.#webRTCConnection = options.webRTCConnection;
    this.#signal = options.signal;
    this.#unsubscribe = options.hostRematchCancelNotifier.subscribe(
      this.#hostRematchCancelNotifier,
    );
  }

  /** @override */
  destructor(): void {
    this.#unsubscribe.unsubscribe();
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<AnonymousBattleSDK> {
    const { armdozerId, pilotId } = options;
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const dataChannel = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    }).dataChannelPromise;
    sendGuestMessage(dataChannel, {
      type: "enter-rematch-room",
      rematchRoomID: this.rematchRoomID,
      armdozerId,
      pilotId,
    });
    const battleStart = await receiveBattleStart({
      dataChannel,
      signal: this.#signal,
    });
    return new GuestBattleSDK({
      hostPlayer: battleStart.hostPlayer,
      guestPlayer: battleStart.guestPlayer,
      initialState: battleStart.update,
      initialFlowID: battleStart.flowID,
      webRTCConnection: this.#webRTCConnection,
      signal: this.#signal,
    });
  }

  /** @override */
  async cancelRematch(): Promise<void> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const dataChannel = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    }).dataChannelPromise;
    sendGuestMessage(dataChannel, {
      type: "guest-cancel-rematch",
      rematchRoomID: this.rematchRoomID,
    });
  }

  /** @override */
  opponentCancelledRematchNotifier(): Observable<unknown> {
    return this.#hostRematchCancelNotifier;
  }
}
