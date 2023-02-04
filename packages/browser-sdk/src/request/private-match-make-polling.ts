import { PrivateMatchRoomID } from "@gbraver-burst-network/browser-core";

/** プライベートルームマッチポーリング */
export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";

  /** ルームID */
  roomID: PrivateMatchRoomID;
};
