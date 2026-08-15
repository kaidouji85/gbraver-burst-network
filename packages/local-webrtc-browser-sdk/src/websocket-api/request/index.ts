import { CreateRoom } from "./create-room";
import { JoinRoom } from "./join-room";
import { SendGuestSignal } from "./send-guest-signal";
import { SendSDP } from "./send-sdp";

/** WebSocketシグナルサーバーへのリクエスト */
export type WSSignalRequest = CreateRoom | JoinRoom | SendSDP | SendGuestSignal;
