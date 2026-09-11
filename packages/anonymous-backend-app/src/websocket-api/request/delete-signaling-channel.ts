import { z } from "zod";

/** シグナリングチャネルを削除する */
export type DeleteSignalingChannel = {
  action: "delete-signaling-channel";
  /** 削除対象となるシグナリングのID */
  signalingID: string;
};

/** DeleteSignalingChannel zodスキーマ */
export const DeleteSignalingChannelSchema = z.object({
  action: z.literal("delete-signaling-channel"),
  signalingID: z.string(),
});
