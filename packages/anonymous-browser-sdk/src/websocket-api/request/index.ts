import { CreateRoom } from "./create-room";
import { DeleteSignalingChannel } from "./delete-signaling-channel";
import { JoinRoom } from "./join-room";
import { SendICECandidate } from "./send-ice-candidate";
import { SendSDP } from "./send-sdp";

/** WebSocketシグナルサーバーへのリクエスト */
export type WSSignalRequest =
  CreateRoom | JoinRoom | SendSDP | SendICECandidate | DeleteSignalingChannel;
