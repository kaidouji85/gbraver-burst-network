import { z } from "zod";

/** シグナリングチャネルの削除に成功した */
export type DeleteSignalingChannelAccepted = {
  type: "delete-signaling-channel-accepted";
};

/** DeleteSignalingChannelAccepted zodスキーマ */
export const DeleteSignalingChannelAcceptedSchema = z.object({
  type: z.literal("delete-signaling-channel-accepted"),
});
