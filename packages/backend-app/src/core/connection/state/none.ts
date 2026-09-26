import { z } from "zod";

/** 状態なし */
export type None = {
  type: "None";
};

/** None zodスキーマ */
export const NoneSchema = z.object({
  type: z.literal("None"),
});
