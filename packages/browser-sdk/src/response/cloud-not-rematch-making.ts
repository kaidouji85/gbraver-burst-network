import { z } from "zod";

/** オーナーが再戦マッチメークできなかった */
export type CloudNotRematchMaking = {
  action: "could-not-rematch-making";
};

/** CloudNotRematchMaking zod スキーマ */
export const CloudNotRematchMakingSchema = z.object({
  action: z.literal("could-not-rematch-making"),
});
