/** エラー */
export type Error = {
  action: "error";
  /** エラー内容 */
  error: unknown;
};
