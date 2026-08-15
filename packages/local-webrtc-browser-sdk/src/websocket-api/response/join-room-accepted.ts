import { z } from "zod";

/** ルーム参加承認 */
export type JoinRoomAccepted = {
  type: "join-room-accepted";
  /** シグナリングID */
  signalingID: string;
};

/** JoinRoomAccepted zod スキーマ */
export const JoinRoomAcceptedSchema = z.object({
  type: z.literal("join-room-accepted"),
  signalingID: z.string(),
});
