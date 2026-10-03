/** プライベートルームマッチポーリング */
import { PrivateMatchRoomID } from "../browser-sdk/private-match";

export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};
