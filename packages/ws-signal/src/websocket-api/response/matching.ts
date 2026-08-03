import {
  RTCIceCandidateInit,
  RTCSessionDescriptionInit,
} from "../../core/webrtc";

/** マッチング成功 */
export type Matching = {
  type: "matching";
  /** マッチング相手のSDP */
  sdp: RTCSessionDescriptionInit;
  /** マッチング相手のICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
