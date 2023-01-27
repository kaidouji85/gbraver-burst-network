/** プライベートマッチルーム作成 */
export type CreatedPrivateMatchRoom = {
  action: "created-private-match-room";

  /** 作成したルームID */
  roomID: string;
};
