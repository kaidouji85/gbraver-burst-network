/** pingの応答 */
export type Pong = {
  type: "pong";
  /** 応答メッセージ */
  message: string;
};
