import { z } from "zod";

/** Session Descriptionのzodスキーマ */
export const RTCSessionDescriptionInitSchema = z.object({
  type: z.enum(["offer", "pranswer", "answer", "rollback"]),
  sdp: z.string().optional(),
});