import { z } from "zod";

/** SDP送信が拒否された */
export type SendSDPRejected = {
  type: "send-sdp-rejected";
};

/** SendSDPRejected zod スキーマ */
export const SendSDPRejectedSchema = z.object({
  type: z.literal("send-sdp-rejected"),
});
