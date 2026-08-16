import { z } from "zod";

/** シグナリングチャネルの削除が拒否された */
export type DeleteSignalingChannelRejected = {
  type: "delete-signaling-channel-rejected";
};

/** DeleteSignalingChannelRejected zodスキーマ  */
export const DeleteSignalingChannelRejectedSchema = z.object({
  type: z.literal("delete-signaling-channel-rejected"),
});
