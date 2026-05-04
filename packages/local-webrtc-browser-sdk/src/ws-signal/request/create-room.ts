/** ホストがルームを作成する */
export type CreateRoom = {
  action: "create-room";
  /** ホストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ホストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
