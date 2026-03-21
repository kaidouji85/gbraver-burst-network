import { GameState, Player } from "gbraver-burst-core";
import { EMPTY, Observable } from "rxjs";

import { BattleSDK } from "./battle-sdk";

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

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostPlayer ホスト側のプレイヤー情報
   * @param options.guestPlayer ゲスト側のプレイヤー情報
   * @param options.initialState ゲームの初期状態
   * @param options.initialFlowID 初期のフローID
   */
  constructor(options: {
    hostPlayer: Player;
    guestPlayer: Player;
    initialState: GameState[];
    initialFlowID: string;
  }) {
    this.player = options.guestPlayer;
    this.enemy = options.hostPlayer;
    this.initialState = options.initialState;
    this.flowID = options.initialFlowID;
  }

  /** @override */
  async progress(): Promise<GameState[]> {
    // TODO 中身を実装する
    return [];
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
