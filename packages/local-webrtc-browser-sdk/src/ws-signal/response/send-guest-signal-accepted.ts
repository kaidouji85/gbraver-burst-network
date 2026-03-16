import { z } from "zod";

/** ゲストのシグナル送信が承認された */
export type SendGuestSignalAccepted = {
  type: "send-guest-signal-accepted";
};

/** SendGuestSignalAccepted zod スキーマ */
export const SendGuestSignalAcceptedSchema = z.object({
  type: z.literal("send-guest-signal-accepted"),
});
