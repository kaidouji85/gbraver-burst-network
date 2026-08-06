import { z } from "zod";

/** ゲストのシグナル送信が拒否された */
export type SendGuestSignalRejected = {
  type: "send-guest-signal-rejected";
};

/** SendGuestSignalRejected zod スキーマ */
export const SendGuestSignalRejectedSchema = z.object({
  type: z.literal("send-guest-signal-rejected"),
});
