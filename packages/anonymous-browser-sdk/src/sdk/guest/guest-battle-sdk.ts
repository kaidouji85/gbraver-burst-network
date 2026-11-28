import {
  ArmdozerId,
  Command,
  GameState,
  PilotId,
  Player,
} from "gbraver-burst-core";
import {
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
  /** WebRTCコネクション */
  readonly #connection: RTCPeerConnection;
  /** データチャネル */
  readonly #dataChannel: RTCDataChannel;
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
   * @param options.connection WebRTCコネクション
   * @param options.dataChannel データチャネル
   * @param options.signal アボートシグナル
   */
  constructor(
    options: {
      hostPlayer: Player;
      guestPlayer: Player;
      initialState: GameState[];
      initialFlowID: string;
      connection: RTCPeerConnection;
      dataChannel: RTCDataChannel;
    } & SignalContainer,
  ) {
    this.player = options.guestPlayer;
    this.enemy = options.hostPlayer;
    this.initialState = options.initialState;
    this.flowID = options.initialFlowID;
    this.#connection = options.connection;
    this.#dataChannel = options.dataChannel;
    this.#signal = options.signal;
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const battleUpdatePromise = receiveBattleUpdate({
      dataChannel: this.#dataChannel,
      signal: this.#signal,
    });

    try {
      sendGuestMessage(this.#dataChannel, {
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
        dataChannel: this.#dataChannel,
      });
      this.#rematchRoom = new GuestRematchRoom({
        rematchRoomID,
        hostRematchCancelNotifier,
        connection: this.#connection,
        dataChannel: this.#dataChannel,
        signal: this.#signal,
      });
    }

    return battleUpdate.update;
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return notifyIceConnectionDisconnected(this.#connection).pipe(
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
  /** WebRTCコネクション */
  readonly #connection: RTCPeerConnection;
  /** データチャネル */
  readonly #dataChannel: RTCDataChannel;
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
   * @param options.hostRematchCancelNotifier ホストからの再戦キャンセル通知
   * @param options.connection WebRTCコネクション
   * @param options.dataChannel データチャネル
   * @param options.signal アボートシグナル
   */
  constructor(
    options: {
      rematchRoomID: string;
      hostRematchCancelNotifier: Observable<HostCancelRematch>;
      connection: RTCPeerConnection;
      dataChannel: RTCDataChannel;
    } & SignalContainer,
  ) {
    this.rematchRoomID = options.rematchRoomID;
    this.#connection = options.connection;
    this.#dataChannel = options.dataChannel;
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

    sendGuestMessage(this.#dataChannel, {
      type: "enter-rematch-room",
      rematchRoomID: this.rematchRoomID,
      armdozerId,
      pilotId,
    });
    const battleStart = await receiveBattleStart({
      dataChannel: this.#dataChannel,
      signal: this.#signal,
    });
    return new GuestBattleSDK({
      hostPlayer: battleStart.hostPlayer,
      guestPlayer: battleStart.guestPlayer,
      initialState: battleStart.update,
      initialFlowID: battleStart.flowID,
      connection: this.#connection,
      dataChannel: this.#dataChannel,
      signal: this.#signal,
    });
  }

  /** @override */
  async cancelRematch(): Promise<void> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    sendGuestMessage(this.#dataChannel, {
      type: "guest-cancel-rematch",
      rematchRoomID: this.rematchRoomID,
    });
  }

  /** @override */
  opponentCancelledRematchNotifier(): Observable<unknown> {
    return this.#hostRematchCancelNotifier;
  }
}
