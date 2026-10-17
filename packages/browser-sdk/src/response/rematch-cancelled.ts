import { z } from "zod";

/** 再戦がキャンセルされた */
export type RematchCancelled = {
  action: "rematch-cancelled";
};

/** RematchCancelled zod スキーマ */
export const RematchCancelledSchema = z.object({
  action: z.literal("rematch-cancelled"),
});
