import { CreateRoom } from "./create-room";
import { JoinRoom } from "./join-room";

/** WebSocketシグナルサーバーへのリクエスト */
export type WSSignalRequest = CreateRoom | JoinRoom;
