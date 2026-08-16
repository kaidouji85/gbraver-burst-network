import { z } from "zod";

/** マッチング成功 */
export type Matching = {
  type: "matching";
  /** シグナリングID */
  signalingID: string;
};

/** Matching zod スキーマ */
export const MatchingSchema = z.object({
  type: z.literal("matching"),
  signalingID: z.string(),
});
