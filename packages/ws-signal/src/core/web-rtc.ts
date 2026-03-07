import { z } from "zod";

/** RTCIceCandidateInit（ブラウザの同名データ型をコピー） */
export type RTCIceCandidateInit = {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
};

/** RTCIceCandidateInit の zod スキーマ */
export const RTCIceCandidateInitSchema = z.object({
  candidate: z.string().optional(),
  sdpMLineIndex: z.number().nullable().optional(),
  sdpMid: z.string().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});

/** RTCSessionDescriptionInit（ブラウザの同名データ型をコピー） */
export type RTCSessionDescriptionInit = {
  type: "offer" | "pranswer" | "answer" | "rollback";
  sdp?: string;
};

/** Session Descriptionのzodスキーマ */
export const RTCSessionDescriptionInitSchema = z.object({
  type: z.enum(["offer", "pranswer", "answer", "rollback"]),
  sdp: z.string().optional(),
});
