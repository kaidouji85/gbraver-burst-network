import { AbortSignaling } from "./abort-signaling";
import { DeleteSignalingChannelAccepted } from "./delete-signaling-channel-accepted";
import { DeleteSignalingChannelRejected } from "./delete-signaling-channel-rejected";
import { JoinRoomAccepted } from "./join-room-accepted";
import { JoinRoomRejected } from "./join-room-rejected";
import { Matching } from "./matching";
import { Pong } from "./pong";
import { ReceiveICECandidate } from "./recieve-ice-candidate";
import { ReceiveRemoteSDP } from "./recieve-remote-sdp";
import { RoomCreationResult } from "./room-creation-result";
import { SendICECandidateRejected } from "./send-ice-candidate-rejected";
import { SendSDPRejected } from "./send-sdp-rejected";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | RoomCreationResult
  | JoinRoomAccepted
  | JoinRoomRejected
  | Matching
  | ReceiveRemoteSDP
  | SendSDPRejected
  | ReceiveICECandidate
  | SendICECandidateRejected
  | DeleteSignalingChannelAccepted
  | DeleteSignalingChannelRejected
  | AbortSignaling;
