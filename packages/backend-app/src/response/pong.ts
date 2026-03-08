/** pingの応答 */
export type Pong = {
  action: "pong";
  /** メッセージ */
  message: string;
};
