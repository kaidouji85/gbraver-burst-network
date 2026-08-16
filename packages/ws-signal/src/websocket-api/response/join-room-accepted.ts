/** ルーム参加承認 */
export type JoinRoomAccepted = {
  type: "join-room-accepted";
  /** シグナリングID */
  signalingID: string;
};
