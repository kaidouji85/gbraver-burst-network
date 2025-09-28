import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

/** socket.ioイベントprogressed */
export type Progressed = {
  /** 新しいフローID */
  flowId: string;
  /** 更新されたゲームステートの履歴 */
  updatedStateHistory: GameState[];
};

/** socket.ioイベントprogressedのZodスキーマ */
export const ProgressedSchema = z.object({
  flowId: z.string(),
  updatedStateHistory: z.array(GameStateSchema),
});
