import {
  ArmdozerId,
  Armdozers,
  Command,
  GameState,
  GBraverBurstCore,
  PilotId,
  Pilots,
  Player,
  startGBraverBurst,
} from "gbraver-burst-core";
import { nanoid } from "nanoid";
import {
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  take,
  takeUntil,
} from "rxjs";

import { SignalContainer } from "../../abort-controller/signal-container";
import { isGameEnd } from "../../core/is-game-end";
import {
  EnterRematchRoom,
  SendCommand,
} from "../../webrtc/guest/guest-message";
import { sendHostMessage } from "../../webrtc/host/host-message";
import { receiveSendCommand } from "../../webrtc/host/receive-send-command";
import { receiveEnterRematchRoom } from "../../webrtc/host/recieve-enter-rematch-room";
import { notifyIceConnectionDisconnected } from "../../webrtc/notify-ice-connection-disconnected";
import {
  AnonymousBattleSDK,
  AnonymousRematchRoom,
} from "../anonymous-battle-sdk";

/** ホスト側バトルSDK */
export class HostBattleSDK implements AnonymousBattleSDK {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];
  /** 最新のフローID */
  flowID: string;
  /** Gブレイバーバーストコア */
  readonly #core: GBraverBurstCore;
  /** WebRTCコネクション */
  readonly #connection: RTCPeerConnection;
  /** データチャンネル */
  readonly #dataChannel: RTCDataChannel;
  /** ゲストからのコマンド受信プロミス */
  #sendCommandPromise: Promise<SendCommand>;
  /** dataChannel.sendの例外通知ストリーム */
  readonly #sendExceptionSubject: Subject<unknown> = new Subject<unknown>();
  /** アボートシグナル */
  readonly #signal: AbortSignal;
  /** 再戦ルーム、バトルが終了したらセットされる */
  #rematchRoom: AnonymousRematchRoom | null = null;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostArmdozerId ホスト側のアームドーザID
   * @param options.hostPilotId ホスト側のパイロットID
   * @param options.guestArmdozerId ゲスト側のアームドーザID
   * @param options.guestPilotId ゲスト側のパイロットID
   * @param options.connection WebRTCコネクション
   * @param options.dataChannel データチャンネル
   * @param options.signal アボートシグナル
   */
  constructor(
    options: {
      hostArmdozerId: ArmdozerId;
      hostPilotId: PilotId;
      guestArmdozerId: ArmdozerId;
      guestPilotId: PilotId;
      connection: RTCPeerConnection;
      dataChannel: RTCDataChannel;
    } & SignalContainer,
  ) {
    const hostPlayerId = nanoid();
    this.player = {
      playerId: hostPlayerId,
      armdozer:
        Armdozers.find((a) => a.id === options.hostArmdozerId) ?? Armdozers[0],
      pilot: Pilots.find((p) => p.id === options.hostPilotId) ?? Pilots[0],
    };

    const guestPlayerId = nanoid();
    this.enemy = {
      playerId: guestPlayerId,
      armdozer:
        Armdozers.find((a) => a.id === options.guestArmdozerId) ?? Armdozers[0],
      pilot: Pilots.find((p) => p.id === options.guestPilotId) ?? Pilots[0],
    };

    this.#core = startGBraverBurst([this.player, this.enemy]);
    this.initialState = this.#core.stateHistory();

    this.#signal = options.signal;

    this.flowID = nanoid();
    this.#connection = options.connection;
    this.#dataChannel = options.dataChannel;
    this.#sendCommandPromise = receiveSendCommand({
      dataChannel: this.#dataChannel,
      flowID: this.flowID,
      signal: this.#signal,
    });
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const sendCommand = await this.#sendCommandPromise;
    const guestCommand = {
      playerId: this.enemy.playerId,
      command: sendCommand.command,
    };
    const hostCommand = { playerId: this.player.playerId, command };
    const update = this.#core.progress([hostCommand, guestCommand]);

    if (isGameEnd(update)) {
      await this.#endGame({ update });
    } else {
      await this.#continueGame({ update });
    }
    return update;
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

  /**
   * ゲームを継続する
   * @param options オプション
   * @param options.update ゲームステート更新結果
   * @returns 処理が完了したら発火するPromise
   */
  async #continueGame(options: { update: GameState[] }) {
    const { update } = options;
    this.flowID = nanoid();
    this.#sendCommandPromise = receiveSendCommand({
      dataChannel: this.#dataChannel,
      flowID: this.flowID,
      signal: this.#signal,
    });
    try {
      sendHostMessage(this.#dataChannel, {
        type: "battle-progressed",
        flowID: this.flowID,
        update,
      });
    } catch (error) {
      this.#sendExceptionSubject.next(error);
      throw error;
    }
  }

  /**
   * ゲームを終了する
   * @param options オプション
   * @param options.update ゲームステート更新結果
   * @returns 処理が完了したら発火するPromise
   */
  async #endGame(options: { update: GameState[] }) {
    const { update } = options;
    const rematchRoomID = nanoid();
    const receiveEnterRematchRoomPromise = receiveEnterRematchRoom({
      dataChannel: this.#dataChannel,
      rematchRoomID,
      signal: this.#signal,
    });
    this.#rematchRoom = new HostRematchRoom({
      rematchRoomID,
      connection: this.#connection,
      dataChannel: this.#dataChannel,
      signal: this.#signal,
      receiveEnterRematchRoomPromise,
    });
    try {
      sendHostMessage(this.#dataChannel, {
        type: "battle-end",
        update,
        rematchRoomID,
      });
    } catch (error) {
      this.#sendExceptionSubject.next(error);
      throw error;
    }
  }
}

/** ホスト側再戦ルーム */
class HostRematchRoom implements AnonymousRematchRoom {
  /** 再戦ルームID */
  readonly rematchRoomID: string;
  /** WebRTCコネクション */
  readonly #connection: RTCPeerConnection;
  /** データチャンネル */
  readonly #dataChannel: RTCDataChannel;
  /** アボートシグナル */
  readonly #signal: AbortSignal;
  /** ゲストが再戦ルームに入室するのを待つPromise */
  readonly #receiveEnterRematchRoomPromise: Promise<EnterRematchRoom>;
  /** iceConnectionがdisconnected状態になったことを通知する */
  readonly #iceConnectionDisconnectedNotifier: ReplaySubject<unknown> =
    new ReplaySubject<unknown>(1);
  /** アンサブスクライブ */
  readonly #unsubscribe: Subscription;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.rematchRoomID 再戦ルームID
   * @param options.receiveEnterRematchRoomPromise ゲストが再戦ルームに入室するのを待つPromise
   */
  constructor(
    options: {
      rematchRoomID: string;
      connection: RTCPeerConnection;
      dataChannel: RTCDataChannel;
      receiveEnterRematchRoomPromise: Promise<EnterRematchRoom>;
    } & SignalContainer,
  ) {
    this.rematchRoomID = options.rematchRoomID;
    this.#connection = options.connection;
    this.#dataChannel = options.dataChannel;
    this.#signal = options.signal;
    this.#receiveEnterRematchRoomPromise =
      options.receiveEnterRematchRoomPromise;
    this.#unsubscribe = notifyIceConnectionDisconnected(
      this.#connection,
    ).subscribe((value) => this.#iceConnectionDisconnectedNotifier.next(value));
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
    const { armdozerId: hostArmdozerId, pilotId: hostPilotId } = options;
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const enterRematchRoom = await this.#receiveEnterRematchRoomPromise;
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      enterRematchRoom;
    const battleSDK = new HostBattleSDK({
      connection: this.#connection,
      dataChannel: this.#dataChannel,
      signal: this.#signal,
      hostArmdozerId,
      hostPilotId,
      guestArmdozerId,
      guestPilotId,
    });
    sendHostMessage(this.#dataChannel, {
      type: "battle-start",
      flowID: battleSDK.flowID,
      hostPlayer: battleSDK.player,
      guestPlayer: battleSDK.enemy,
      update: battleSDK.initialState,
    });
    return battleSDK;
  }

  /** @override */
  async cancelRematch(): Promise<void> {
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    sendHostMessage(this.#dataChannel, {
      type: "host-cancel-rematch",
      rematchRoomID: this.rematchRoomID,
    });
  }

  /** @override */
  opponentCancelledRematchNotifier(): Observable<unknown> {
    return this.#iceConnectionDisconnectedNotifier;
  }
}
