/** シグナル情報 */
export type Signal = {
  sdp: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
};
