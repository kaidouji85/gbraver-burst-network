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
import { isGameEnd } from "../../core/is-game-end";
import {
  EnterRematchRoom,
  GuestCancelRematch,
  SendCommand,
} from "../../webrtc/guest/guest-message";
import { sendHostMessage } from "../../webrtc/host/host-message";
import { notifyGuestRematchCancel } from "../../webrtc/host/notify-guest-rematch-cancel";
import { receiveSendCommand } from "../../webrtc/host/receive-send-command";
import { receiveEnterRematchRoom } from "../../webrtc/host/recieve-enter-rematch-room";
import { notifyIceConnectionDisconnected } from "../../webrtc/notify-ice-connection-disconnected";
import {
  AnonymousBattleSDK,
  AnonymousRematchRoom,
} from "../anonymous-battle-sdk";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";

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
  /** ホスト側のWebRTCコネクションマネージャー */
  readonly #webRTCConnection: HostWebRTCConnectionManager;
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
   * @param options.webRTCConnection ホスト側のWebRTC接続マネージャー
   * @param options.signal アボートシグナル
   */
  constructor(
    options: {
      hostArmdozerId: ArmdozerId;
      hostPilotId: PilotId;
      guestArmdozerId: ArmdozerId;
      guestPilotId: PilotId;
      webRTCConnection: HostWebRTCConnectionManager;
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
    this.#webRTCConnection = options.webRTCConnection;
    this.#sendCommandPromise = this.#webRTCConnection
      .getOrCreateConnection({ signal: this.#signal })
      .then(({ dataChannel }) =>
        receiveSendCommand({
          dataChannel,
          flowID: this.flowID,
          signal: this.#signal,
        }),
      );
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
    return from(
      this.#webRTCConnection.getOrCreateConnection().then((v) => v.connection),
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

  /**
   * ゲームを継続する
   * @param options オプション
   * @param options.update ゲームステート更新結果
   * @returns 処理が完了したら発火するPromise
   */
  async #continueGame(options: { update: GameState[] }) {
    const { update } = options;
    this.flowID = nanoid();
    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    });
    this.#sendCommandPromise = receiveSendCommand({
      dataChannel,
      flowID: this.flowID,
      signal: this.#signal,
    });
    try {
      sendHostMessage(dataChannel, {
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
    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    });
    const rematchRoomID = nanoid();
    const receiveEnterRematchRoomPromise = receiveEnterRematchRoom({
      dataChannel,
      rematchRoomID,
      signal: this.#signal,
    });
    const guestRematchCancelNotifier = notifyGuestRematchCancel({
      rematchRoomID,
      dataChannel,
    });
    this.#rematchRoom = new HostRematchRoom({
      rematchRoomID,
      webRTCConnection: this.#webRTCConnection,
      signal: this.#signal,
      receiveEnterRematchRoomPromise,
      guestRematchCancelNotifier,
    });
    try {
      sendHostMessage(dataChannel, {
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
  /** ホスト側のWebRTCコネクションマネージャー */
  readonly #webRTCConnection: HostWebRTCConnectionManager;
  /** アボートシグナル */
  readonly #signal: AbortSignal;
  /** ゲストが再戦ルームに入室するのを待つPromise */
  readonly #receiveEnterRematchRoomPromise: Promise<EnterRematchRoom>;
  /** ゲストからの再戦キャンセル通知 */
  readonly #guestRematchCancelNotifier: ReplaySubject<GuestCancelRematch> =
    new ReplaySubject<GuestCancelRematch>(1);
  /** アンサブスクライブ */
  readonly #unsubscribe: Subscription;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.rematchRoomID 再戦ルームID
   * @param options.webRTCConnection ホスト側のWebRTCコネクションマネージャー
   * @param options.receiveEnterRematchRoomPromise ゲストが再戦ルームに入室するのを待つPromise
   * @param options.guestRematchCancelNotifier ゲストからの再戦キャンセル通知
   */
  constructor(
    options: {
      rematchRoomID: string;
      webRTCConnection: HostWebRTCConnectionManager;
      receiveEnterRematchRoomPromise: Promise<EnterRematchRoom>;
      guestRematchCancelNotifier: Observable<GuestCancelRematch>;
    } & SignalContainer,
  ) {
    this.rematchRoomID = options.rematchRoomID;
    this.#webRTCConnection = options.webRTCConnection;
    this.#signal = options.signal;
    this.#receiveEnterRematchRoomPromise =
      options.receiveEnterRematchRoomPromise;
    this.#unsubscribe = options.guestRematchCancelNotifier.subscribe(
      this.#guestRematchCancelNotifier,
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
    const { armdozerId: hostArmdozerId, pilotId: hostPilotId } = options;
    if (this.#signal.aborted) {
      return Promise.reject(this.#signal.reason);
    }

    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    });
    const enterRematchRoom = await this.#receiveEnterRematchRoomPromise;
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      enterRematchRoom;
    const battleSDK = new HostBattleSDK({
      webRTCConnection: this.#webRTCConnection,
      signal: this.#signal,
      hostArmdozerId,
      hostPilotId,
      guestArmdozerId,
      guestPilotId,
    });
    sendHostMessage(dataChannel, {
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

    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal: this.#signal,
    });
    sendHostMessage(dataChannel, {
      type: "host-cancel-rematch",
      rematchRoomID: this.rematchRoomID,
    });
  }

  /** @override */
  opponentCancelledRematchNotifier(): Observable<unknown> {
    return this.#guestRematchCancelNotifier;
  }
}
