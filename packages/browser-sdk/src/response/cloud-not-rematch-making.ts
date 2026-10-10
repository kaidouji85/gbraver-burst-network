import { z } from "zod";

/** オーナーが再戦マッチメークできなかった */
export type CloudNotRematchMaking = {
  action: "cloud-not-rematch-making";
};

/** CloudNotRematchMaking zod スキーマ */
export const CloudNotRematchMakingSchema = z.object({
  action: z.literal("cloud-not-rematch-making"),
});
