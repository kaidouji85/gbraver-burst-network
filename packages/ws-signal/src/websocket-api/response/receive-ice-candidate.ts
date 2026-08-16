import { RTCIceCandidateInit } from "../../core/webrtc";

/** 相手からICE candidate を受信した */
export type ReceiveICECandidate = {
  type: "receive-ice-candidate";
  /** シグナリングID */
  signalingID: string;
  /** ICE candidate */
  iceCandidate: RTCIceCandidateInit;
};
