/** プライベートルームマッチポーリング */
import { PrivateMatchRoomID } from "../private-match";

export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};
