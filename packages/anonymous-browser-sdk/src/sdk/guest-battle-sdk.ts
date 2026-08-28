import { Command, GameState, Player } from "gbraver-burst-core";
import { from, mergeMap, Observable, Subject, take, takeUntil } from "rxjs";

import { sendGuestMessage } from "../webrtc/guest/guest-message";
import { receiveBattleProgressed } from "../webrtc/guest/receive-battle-progressed";
import { notifyConnectionFailed } from "../webrtc/notify-connection-failed";
import { BattleSDK } from "./battle-sdk";
import { GuestWebRTCConnectionManager } from "./guest-webrtc-connection-manager";

/** ゲスト側バトルSDK */
export class GuestBattleSDK implements BattleSDK {
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

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostPlayer ホスト側のプレイヤー情報
   * @param options.guestPlayer ゲスト側のプレイヤー情報
   * @param options.initialState ゲームの初期状態
   * @param options.initialFlowID 初期のフローID
   * @param options.webRTCConnection ホストのWebRTCコネクションマネージャー
   */
  constructor(options: {
    hostPlayer: Player;
    guestPlayer: Player;
    initialState: GameState[];
    initialFlowID: string;
    webRTCConnection: GuestWebRTCConnectionManager;
  }) {
    this.player = options.guestPlayer;
    this.enemy = options.hostPlayer;
    this.initialState = options.initialState;
    this.flowID = options.initialFlowID;
    this.#webRTCConnection = options.webRTCConnection;
  }

  /** @override */
  async progress(command: Command): Promise<GameState[]> {
    const dataChannel =
      await this.#webRTCConnection.getOrCreateConnection().dataChannelPromise;
    const battleProgressedPromise = receiveBattleProgressed(dataChannel);
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
    const battleProgressed = await battleProgressedPromise;
    this.flowID = battleProgressed.flowID;
    return battleProgressed.update;
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
}
