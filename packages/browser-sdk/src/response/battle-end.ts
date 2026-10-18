import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";
  /** 更新されたゲームステート */
  update: GameState[];
  /** 再戦ルームID */
  rematchRoomID: string;
  /** 自分がホストか否か、trueの場合は自分がホスト */
  isHost: boolean;
};

/** BattleEnd zodスキーマ */
export const BattleEndSchema = z.object({
  action: z.literal("battle-end"),
  update: z.array(GameStateSchema),
  rematchRoomID: z.string(),
  isHost: z.boolean(),
});

/**
 * @deprecated BattleEndSchemaを利用すること
 * 任意オブジェクトをBattleEndにパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @returns パース結果
 */
export function parseBattleEnd(data: unknown): BattleEnd | null {
  const result = BattleEndSchema.safeParse(data);
  return result.success ? result.data : null;
}
