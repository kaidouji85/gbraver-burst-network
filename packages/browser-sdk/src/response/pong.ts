/** pingのレスポンス */
export type Pong = {
  action: "pong";

  /** メッセージ */
  message: string;
};

/**
 * 任意のオブジェクトをPingResponseにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元となるオブジェクト
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parsePong(data: any): Pong | null {
  /* eslint-enable */
  return data?.action === "pong" && typeof data?.message === "string"
    ? {
        action: data.action,
        message: data.message,
      }
    : null;
}
