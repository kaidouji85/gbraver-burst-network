/** ゲストが入室する */
export type JoinRoom = {
  action: "join-room";
  /** ルームID */
  roomID: string;
  /** クライアントのSDP */
  sdp: RTCSessionDescriptionInit;
  /** クライアントのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
