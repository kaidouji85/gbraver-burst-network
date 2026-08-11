import { Error } from "./error";
import { JoinRoomAccepted } from "./join-room-accepted";
import { JoinRoomRejected } from "./join-room-rejected";
import { Pong } from "./pong";
import { RoomCreationResult } from "./room-creation-result";
import { SignalingChannelStarted } from "./signaling-channel-started";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | RoomCreationResult
  | JoinRoomAccepted
  | JoinRoomRejected
  | SignalingChannelStarted
  | Error;
