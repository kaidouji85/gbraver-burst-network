import { GameState, GameStateSchema, Player, PlayerSchema } from "gbraver-burst-core";
import { z } from "zod";

/** バトルスタート */
export type BattleStart = {
  action: "battle-start";
  /** プレイヤー情報 */
  player: Player;
  /** 敵情報 */
  enemy: Player;
  /** ステートヒストリー */
  stateHistory: GameState[];
  /** 戦闘ID */
  battleID: string;
  /** フローID */
  flowID: string;
  /** 戦闘進捗ポーリングを実行する側か否か、trueでポーリングをする */
  isPoller: boolean;
};

/** BattleStart zodスキーマ */
export const BattleStartSchema = z.object({
  action: z.literal("battle-start"),
  player: PlayerSchema,
  enemy: PlayerSchema,
  stateHistory: z.array(GameStateSchema),
  battleID: z.string(),
  flowID: z.string(),
  isPoller: z.boolean(),
});

/**
 * 任意のオブジェクトをStartBattleにパースする
 * パースできない場合はnullを返す
 * @param data パース元となる文字列
 * @return パース結果
 */
export function parseBattleStart(data: unknown): BattleStart | null {
  const result = BattleStartSchema.safeParse(data);
  return result.success ? result.data : null;
}
