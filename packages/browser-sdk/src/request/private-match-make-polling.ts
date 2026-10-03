/** プライベートルームマッチポーリング */
import { PrivateMatchRoomID } from "../browser-sdk/private-match-sdk/private-match-sdk";

export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};
