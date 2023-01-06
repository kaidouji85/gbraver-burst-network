/** エラー */
export type Error = {
  action: "error";
  error: any;
};

/**
 * 任意オブジェクトをErrorにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseError(data: any): Error | null {
  return data?.action === "error" && typeof data?.error !== "undefined" ? {
    action: data.action,
    error: data.error
  } : null;
}