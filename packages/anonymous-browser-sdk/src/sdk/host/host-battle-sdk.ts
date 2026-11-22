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
import { from, mergeMap, Observable, Subject, take, takeUntil } from "rxjs";

import { AbortManager } from "../../abort-controller/abort-manager";
import { SignalContainer } from "../../abort-controller/signal-container";
import { isGameEnd } from "../../core/is-game-end";
import { SendCommand } from "../../webrtc/guest/guest-message";
import { sendHostMessage } from "../../webrtc/host/host-message";
import { receiveSendCommand } from "../../webrtc/host/receive-send-command";
import { receiveEnterRematchRoom } from "../../webrtc/host/recieve-enter-rematch-room";
import { notifyConnectionFailed } from "../../webrtc/notify-connection-failed";
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
  #core: GBraverBurstCore;
  /** ホスト側のWebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** ゲストからのコマンド受信プロミス */
  #sendCommandPromise: Promise<SendCommand>;
  /** dataChannel.sendの例外通知ストリーム */
  #sendExceptionSubject: Subject<unknown> = new Subject<unknown>();
  /** アボート管理オブジェクト */
  #abortManager: AbortManager;
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
   * @param options.abortManager アボート管理オブジェクト
   */
  constructor(options: {
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
    guestArmdozerId: ArmdozerId;
    guestPilotId: PilotId;
    webRTCConnection: HostWebRTCConnectionManager;
    abortManager: AbortManager;
  }) {
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

    this.#abortManager = options.abortManager;
    const { signal } = this.#abortManager.getAbortController();

    this.flowID = nanoid();
    this.#webRTCConnection = options.webRTCConnection;
    this.#sendCommandPromise = this.#webRTCConnection
      .getOrCreateConnection({ signal })
      .then(({ dataChannel }) =>
        receiveSendCommand({ dataChannel, flowID: this.flowID, signal }),
      );
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const { signal } = this.#abortManager.getAbortController();
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }

    const sendCommand = await this.#sendCommandPromise;
    const guestCommand = {
      playerId: this.enemy.playerId,
      command: sendCommand.command,
    };
    const hostCommand = { playerId: this.player.playerId, command };
    const update = this.#core.progress([hostCommand, guestCommand]);

    if (isGameEnd(update)) {
      await this.#endGame({ signal, update });
    } else {
      await this.#continueGame({ signal, update });
    }
    return update;
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return from(
      this.#webRTCConnection.getOrCreateConnection().then((v) => v.connection),
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

  /**
   * ゲームを継続する
   * @param options オプション
   * @param options.update ゲームステート更新結果
   * @param options.signal アボートシグナル
   * @returns 処理が完了したら発火するPromise
   */
  async #continueGame(options: { update: GameState[] } & SignalContainer) {
    const { signal, update } = options;
    this.flowID = nanoid();
    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal,
    });
    this.#sendCommandPromise = receiveSendCommand({
      dataChannel,
      flowID: this.flowID,
      signal,
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
   * @param options.signal アボートシグナル
   * @returns 処理が完了したら発火するPromise
   */
  async #endGame(options: { update: GameState[] } & SignalContainer) {
    const { signal, update } = options;
    const rematchRoomID = nanoid();
    // TODO 再戦ルーム生成およびプロパティへのセットを実装する
    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal,
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
class HostRematchRoom {
  /** 再戦ルームID */
  readonly rematchRoomID: string;
  /** ホスト側のWebRTCコネクションマネージャー */
  readonly #webRTCConnection: HostWebRTCConnectionManager;
  /** アボート管理オブジェクト */
  readonly #abortManager: AbortManager;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.rematchRoomID 再戦ルームID
   * @param options.webRTCConnection ホスト側のWebRTCコネクションマネージャー
   * @param options.abortManager アボート管理オブジェクト
   */
  constructor(options: {
    rematchRoomID: string;
    webRTCConnection: HostWebRTCConnectionManager;
    abortManager: AbortManager;
  }) {
    this.rematchRoomID = options.rematchRoomID;
    this.#webRTCConnection = options.webRTCConnection;
    this.#abortManager = options.abortManager;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<AnonymousBattleSDK> {
    const { armdozerId: hostArmdozerId, pilotId: hostPilotId } = options;
    const { signal } = this.#abortManager.getAbortController();
    if (signal?.aborted) {
      return Promise.reject(signal.reason);
    }

    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal,
    });
    const enterRematchRoom = await receiveEnterRematchRoom({
      dataChannel,
      rematchRoomID: this.rematchRoomID,
      signal,
    });
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      enterRematchRoom;
    const battleSDK = new HostBattleSDK({
      webRTCConnection: this.#webRTCConnection,
      abortManager: this.#abortManager,
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
    const { signal } = this.#abortManager.getAbortController();
    if (signal?.aborted) {
      return Promise.reject(signal.reason);
    }

    const { dataChannel } = await this.#webRTCConnection.getOrCreateConnection({
      signal,
    });
    sendHostMessage(dataChannel, {
      type: "host-cancel-rematch",
      rematchRoomID: this.rematchRoomID,
    });
  }
}
