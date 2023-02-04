import { nanoid } from "nanoid";

import { PrivateMatchRoomID } from "./private-match-room";

/**
 * プライベートマッチルームIDを発行する
 * @return 発行したプライベートマッチルームID
 */
export function generatePrivateMatchRoomID(): PrivateMatchRoomID {
  return nanoid();
}
