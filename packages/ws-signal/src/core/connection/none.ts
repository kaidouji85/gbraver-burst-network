import { z } from "zod";

/** 状態なし */
export type None = {
  type: "none";
};

/** None zodスキーマ */
export const NoneSchema = z.object({
  type: z.literal("none"),
});
