/** ゲストのシグナルを送信 */
export type SendGuestSignal = {
  action: "send-guest-signal";
  /** ルームID */
  roomID: string;
  /** 予約ID */
  reservationID: string;
  /** ゲストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ゲストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};
