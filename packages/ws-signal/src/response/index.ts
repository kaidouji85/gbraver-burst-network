import { Error } from "./error";
import { JoinRoomAccepted } from "./join-room-accepted";
import { JoinRoomRejected } from "./join-room-rejected";
import { Matching } from "./matching";
import { Pong } from "./pong";
import { RoomCreationResult } from "./room-creation-result";
import { SendGuestSignalAccepted } from "./send-guest-signal-accpected";
import { SendGuestSignalRejected } from "./send-guest-signal-rejected";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | RoomCreationResult
  | JoinRoomAccepted
  | JoinRoomRejected
  | SendGuestSignalAccepted
  | SendGuestSignalRejected
  | Matching
  | Error;
