import { Pong } from "./pong";
import { RoomCreationResult } from "./room-creation-result";

/** エラー */
export type Error = {
  action: "error";
  error: unknown;
};

/** websocketがクライアントに返すデータ */
export type WebsocketResponse = Pong | RoomCreationResult | Error;
