import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

/** socket.ioイベントgameEnded */
export type GameEnded = {
  /** 更新されたゲームステートの履歴 */
  updatedStateHistory: GameState[];
};

/** socket.ioイベントgameEndedのZodスキーマ */
export const GameEndedSchema = z.object({
  updatedStateHistory: z.array(GameStateSchema),
});
