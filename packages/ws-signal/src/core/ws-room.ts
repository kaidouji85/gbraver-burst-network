import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "./webrtc";

/** ルームの状態 */
export type WSSignalRoomState = "awaiting-guest-join" | "awaiting-guest-signal";

/** WSSignalRoomState zod スキーマ */
export const WSSignalRoomStateSchema = z.union([
  z.literal("awaiting-guest-join"),
  z.literal("awaiting-guest-signal"),
]);

/** ルーム情報 */
export type WSSignalRoom = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /**
   * 予約ID
   * マッチングしたゲストに本プロパティの値を伝え、
   * シグナルサーバー側はこれが一致しているかで検証する
   */
  reservationID: string;
  /** ホストのコネクションID */
  hostConnectionId: string;
  /** ルームのホストのシグナル情報 */
  hostSignal: {
    /** WebRTCのセッション記述 */
    sdp: RTCSessionDescriptionInit;
    /** WebRTCのICE候補 */
    iceCandidates: RTCIceCandidateInit[];
  };
  /** ルームの状態 */
  state: WSSignalRoomState;
};

/** WSSignalRoom zod スキーマ */
export const WSSignalRoomSchema = z.object({
  roomID: z.string(),
  reservationID: z.string(),
  hostConnectionId: z.string(),
  hostSignal: z.object({
    sdp: RTCSessionDescriptionInitSchema,
    iceCandidates: z.array(RTCIceCandidateInitSchema),
  }),
  state: WSSignalRoomStateSchema,
});
