import { nanoid } from "nanoid";

import { PrivateMatchRoomID } from "./private-match-room";

/**
 * プライベートマッチルームIDを発行する
 * @returns 発行したプライベートマッチルームID
 */
export function generatePrivateMatchRoomID(): PrivateMatchRoomID {
  return nanoid();
}
