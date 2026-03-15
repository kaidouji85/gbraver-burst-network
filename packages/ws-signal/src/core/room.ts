import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "./webrtc";

/** ルームの状態 */
export type RoomState = "awaiting-guest-join" | "awaiting-guest-signal";

/** RoomState zod スキーマ */
export const RoomStateSchema = z.union([
  z.literal("awaiting-guest-join"),
  z.literal("awaiting-guest-signal"),
]);

/** ルーム情報 */
export type DynamoRoom = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /**
   * 予約ID
   * マッチングしたゲストに本プロパティの値を伝え、
   * シグナルサーバー側はこれが一致しているかで検証する
   */
  reservationId: string;
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
  state: RoomState;
};

/** DynamoRoom zod スキーマ */
export const DynamoRoomSchema = z.object({
  roomID: z.string(),
  reservationId: z.string(),
  hostConnectionId: z.string(),
  hostSignal: z.object({
    sdp: RTCSessionDescriptionInitSchema,
    iceCandidates: z.array(RTCIceCandidateInitSchema),
  }),
  state: RoomStateSchema,
});
