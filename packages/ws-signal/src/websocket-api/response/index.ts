import { JoinRoomAccepted } from "./join-room-accepted";
import { JoinRoomRejected } from "./join-room-rejected";
import { Matching } from "./matching";
import { Pong } from "./pong";
import { ReceiveRemoteSDP } from "./recieve-remote-sdp";
import { RoomCreationResult } from "./room-creation-result";
import { SendSDPRejected } from "./send-sdp-rejected";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | RoomCreationResult
  | JoinRoomAccepted
  | JoinRoomRejected
  | Matching
  | ReceiveRemoteSDP
  | SendSDPRejected;
