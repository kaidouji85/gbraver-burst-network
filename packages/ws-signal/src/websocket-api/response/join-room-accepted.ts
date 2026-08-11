/** ルーム参加承認 */
export type JoinRoomAccepted = {
  type: "join-room-accepted";
  /** 予約ID */
  reservationID: string;
};
