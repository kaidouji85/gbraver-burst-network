import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

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
