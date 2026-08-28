/** ゲストが入室する */
export type JoinRoom = {
  action: "join-room";
  /** ルームID */
  roomID: string;
};
