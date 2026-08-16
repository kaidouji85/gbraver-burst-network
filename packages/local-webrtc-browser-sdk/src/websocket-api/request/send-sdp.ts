/** SDPを送信する */
export type SendSDP = {
  action: "send-sdp";
  /** シグナリングID */
  signalingID: string;
  /** SDP */
  sdp: RTCSessionDescriptionInit;
};
