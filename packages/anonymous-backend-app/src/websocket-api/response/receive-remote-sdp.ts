import { RTCSessionDescriptionInit } from "../../core/webrtc";

/** 相手からSDPを受信した */
export type ReceiveRemoteSDP = {
  type: "receive-remote-sdp";
  /** シグナリングID */
  signalingID: string;
  /** SDP */
  sdp: RTCSessionDescriptionInit;
};
