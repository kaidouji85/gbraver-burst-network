/** ICE candidateを送信する */
export type SendICECandidate = {
  action: "send-ice-candidate";
  /** シグナリングID */
  signalingID: string;
  /** ICE candidate */
  iceCandidate: RTCIceCandidateInit;
};
