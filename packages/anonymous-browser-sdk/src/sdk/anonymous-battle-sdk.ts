import {
  ArmdozerId,
  Command,
  GameState,
  PilotId,
  Player,
} from "gbraver-burst-core";
import { Observable } from "rxjs";

/**
 * 匿名ユーザー用バトルSDK
 * 本操作は匿名ログイン後に実行することを想定している
 */
export interface AnonymousBattleSDK {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];

  /**
   * バトルを進行させる
   * @param command プレイヤーが入力するコマンド
   * @returns ゲーム結果
   */
  progress(command: Command): Promise<GameState[]>;

  /**
   * バトル強制終了の通知ストリーム
   * @returns 通知ストリーム
   */
  suddenlyBattleEndNotifier(): Observable<unknown>;

  /**
   * バトルが正常終了した後に、再戦ルームを取得する
   * @return バトル正常終了後であれば再戦ルーム、そうでなければnull
   */
  getRematchRoom(): AnonymousRematchRoom | null;
}

/** 匿名再戦ルーム */
export interface AnonymousRematchRoom {
  /**
   * デストラクタ相当の処理
   */
  destructor(): void;

  /**
   * 再戦をリクエストする
   * @param options オプション
   * @param options.armdozerId 選択したアームドーザのID
   * @param options.pilotId 選択したパイロットのID
   * @returns 正立した場合は新しいBattleSDKインスタンスを返す
   */
  requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<AnonymousBattleSDK>;

  /**
   * 再戦をキャンセルする
   * @returns 処理が完了したら発火するPromise
   */
  cancelRematch(): Promise<void>;

  /**
   * 対戦相手が再戦をキャンセルしたことを通知するストリーム
   * @returns 通知ストリーム
   */
  opponentCancelledRematchNotifier(): Observable<unknown>;
}
