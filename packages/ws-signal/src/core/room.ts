import { RTCIceCandidateInit, RTCSessionDescriptionInit } from "./webrtc";

/** ルームの状態 */
type RoomState = "awaiting-guest-join" | "awaiting-guest-signal";

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
