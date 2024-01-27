/** websocket apiに返すデータ */
export type WebsocketAPIResponse = {
  /** ステータスコード */
  statusCode: number;
  /** ボディ */
  body: string;
};
