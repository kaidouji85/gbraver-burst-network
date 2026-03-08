import { Error } from "./error";
import { Pong } from "./pong";
import { RoomCreationResult } from "./room-creation-result";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse = Pong | RoomCreationResult | Error;
