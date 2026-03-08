/** pingの応答 */
export type Pong = {
  action: "pong";
  message: string;
};

/** ルーム生成成功 */
export type RoomCreationSuccess = {
  type: "room-creation-result";
  isSuccess: true;
  roomID: string;
};

/** ルーム生成失敗 */
export type RoomCreationFailure = {
  type: "room-creation-result";
  isSuccess: false;
};

/** ルーム生成結果 */
export type RoomCreationResult = RoomCreationSuccess | RoomCreationFailure;

/** エラー */
export type Error = {
  action: "error";
  error: unknown;
};

/** websocketがクライアントに返すデータ */
export type WebsocketResponse = Pong | RoomCreationResult | Error;
