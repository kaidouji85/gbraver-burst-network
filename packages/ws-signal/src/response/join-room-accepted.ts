import { RTCIceCandidateInit, RTCSessionDescriptionInit } from "../core/webrtc";

/** ルーム参加承認 */
export type JoinRoomAccepted = {
  type: "join-room-accepted";
  /** 予約ID */
  reservationID: string;
  /** ホストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ホストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
