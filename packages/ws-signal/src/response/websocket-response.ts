/** websocketがクライアントに返すデータ */
export type WebsocketResponse = Pong | Error;

/** pingの応答 */
export type Pong = {
  action: "pong";
  message: string;
};

/** エラー */
export type Error = {
  action: "error";
  error: unknown;
};
