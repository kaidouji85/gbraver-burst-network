import { z } from "zod";

/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: "CasualMatchMaking";
}; /** CasualMatchMaking zodスキーマ */

export const CasualMatchMakingSchema = z.object({
  type: z.literal("CasualMatchMaking"),
});
