import { RTCIceCandidateInit } from "../core/web-rtc";

/** ホストがルームを作成する */
export type CreateRoom = {
  action: "create-room";
  /** ホストのSDP */
  sdp: RTCIceCandidateInit;
  /** ホストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
