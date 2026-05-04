import { CreateRoom } from "./create-room";
import { JoinRoom } from "./join-room";
import { SendGuestSignal } from "./send-guest-signal";

/** WebSocketシグナルサーバーへのリクエスト */
export type WSSignalRequest = CreateRoom | JoinRoom | SendGuestSignal;
