import { Command, GameState, Player } from "gbraver-burst-core";
import { EMPTY, Observable } from "rxjs";

import { sendGuestMessage } from "../webrtc/guest/guest-message";
import { receiveBattleProgressed } from "../webrtc/guest/receive-battle-progressed";
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
      await this.#webRTCConnection.getOrCreateConnection().dataChannel;
    const battleProgressedPromise = receiveBattleProgressed(dataChannel);
    sendGuestMessage(dataChannel, {
      type: "send-command",
      flowID: this.flowID,
      command,
    });
    const battleProgressed = await battleProgressedPromise;
    this.flowID = battleProgressed.flowID;
    return battleProgressed.update;
  }

  /**
   * バトル強制終了の通知ストリーム
   * @returns 通知ストリーム
   */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    // TODO 中身を実装する
    return EMPTY;
  }
}
