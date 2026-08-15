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

import { SendCommand } from "../webrtc/guest/guest-message";
import { sendHostMessage } from "../webrtc/host/host-message";
import { receiveSendCommand } from "../webrtc/host/receive-send-command";
import { notifyConnectionFailed } from "../webrtc/notify-connection-failed";
import { BattleSDK } from "./battle-sdk";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";

/** ホスト側バトルSDK */
export class HostBattleSDK implements BattleSDK {
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

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostArmdozerId ホスト側のアームドーザID
   * @param options.hostPilotId ホスト側のパイロットID
   * @param options.guestArmdozerId ゲスト側のアームドーザID
   * @param options.guestPilotId ゲスト側のパイロットID
   * @param options.webRTCConnection ホスト側のWebRTC接続マネージャー
   */
  constructor(options: {
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
    guestArmdozerId: ArmdozerId;
    guestPilotId: PilotId;
    webRTCConnection: HostWebRTCConnectionManager;
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

    this.flowID = nanoid();
    this.#webRTCConnection = options.webRTCConnection;
    this.#sendCommandPromise = this.#webRTCConnection
      .getOrCreateConnection()
      .then(({ dataChannel }) => receiveSendCommand(dataChannel, this.flowID));
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const sendCommand = await this.#sendCommandPromise;
    const hostCommand = { playerId: this.player.playerId, command };
    const guestCommand = {
      playerId: this.enemy.playerId,
      command: sendCommand.command,
    };
    const update = this.#core.progress([hostCommand, guestCommand]);

    this.flowID = nanoid();
    const { dataChannel } =
      await this.#webRTCConnection.getOrCreateConnection();
    this.#sendCommandPromise = receiveSendCommand(dataChannel, this.flowID);
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
    return update;
  }

  /**
   * バトル強制終了の通知ストリーム
   * @returns 通知ストリーム
   */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return from(
      this.#webRTCConnection.getOrCreateConnection().then((v) => v.connection),
    ).pipe(
      mergeMap((connection) => notifyConnectionFailed(connection)),
      takeUntil(this.#sendExceptionSubject),
      take(1),
    );
  }
}
