import { PrivateMatchRoomID } from "../core/private-match-room";

/** オーナーがプライベートマッチルーム作成に成功した */
export type CreatedPrivateMatchRoom = {
  action: "created-private-match-room";
  /** 作成したルームID */
  roomID: PrivateMatchRoomID;
};
