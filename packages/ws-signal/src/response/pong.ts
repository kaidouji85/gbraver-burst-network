/** pingの応答 */
export type Pong = {
  action: "pong";
  /** 応答メッセージ */
  message: string;
};
