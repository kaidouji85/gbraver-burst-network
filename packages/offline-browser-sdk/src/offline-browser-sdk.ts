import {
  ArmdozerId,
  Command,
  GameState,
  GameStateSchema,
  PilotId,
  Player,
  PlayerSchema,
} from "gbraver-burst-core";
import { Observable } from "rxjs";
import { z } from "zod";

/** バトル情報 */
export type BattleInfo = {
  /** バトルID */
  battleId: string;
  /** 初期フローID */
  flowId: string;
  /** 自分自身のプレイヤー情報 */
  player: Player;
  /** ゲームステートの履歴 */
  stateHistory: GameState[];
};

/** バトル情報のZodスキーマ */
export const BattleInfoSchema = z.object({
  battleId: z.string(),
  flowId: z.string(),
  player: PlayerSchema,
  stateHistory: z.array(GameStateSchema),
});

/** ゲーム進行結果 */
export type GameProgressResult = {
  /** 新しいフローID */
  flowId: string;
  /** 更新されたゲームステートの履歴 */
  updatedStateHistory: GameState[];
};

/** ゲーム進行結果のZodスキーマ */
export const GameProgressResultSchema = z.object({
  flowId: z.string(),
  updatedStateHistory: z.array(GameStateSchema),
});

/** オフライン用ブラウザSDK */

export interface OfflineBrowserSDK {
  /**
   * 対戦ルームに入室する
   * @param options オプション
   * @param options.armdozerId アームドーザID
   * @param options.pilotId パイロットID
   * @returns マッチングしたら発火するPromise
   */
  enterRoom(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleInfo>;

  /**
   * コマンドを送信する
   * @param command 送信するコマンド
   */
  sendCommand(command: Command): Promise<GameProgressResult>;

  /**
   * エラーを通知するObservableを取得する
   * @returns エラー通知のObservable
   */
  notifyError(): Observable<unknown>;
}
