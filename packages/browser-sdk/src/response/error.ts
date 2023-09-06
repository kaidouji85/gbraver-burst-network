/** エラー */
export type Error = {
  action: "error";
  /** エラー情報 */
  error: unknown;
};

/**
 * 任意オブジェクトをErrorにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseError(data: any): Error | null {
  /* eslint-enable */
  return data?.action === "error" && typeof data?.error !== "undefined"
    ? {
        action: data.action,
        error: data.error,
      }
    : null;
}
