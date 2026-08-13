import { JoinRoomAccepted } from "./join-room-accepted";
import { JoinRoomRejected } from "./join-room-rejected";
import { Matching } from "./matching";
import { Pong } from "./pong";
import { RoomCreationResult } from "./room-creation-result";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  Pong | RoomCreationResult | JoinRoomAccepted | JoinRoomRejected | Matching;
