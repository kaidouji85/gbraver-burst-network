/**
 * AbortErrorを生成する
 * 本関数で生成する例外はfetchのAbortSignalがabortされた際に発生するものを模倣している
 * @param message エラーメッセージ
 * @returns AbortError
 */
export const createAbortError = (message: string) =>
  new DOMException(message, "AbortError");

/**
 * 渡されたエラーがAbortErrorかどうかを判定する
 * @param error 判定対象のエラー
 * @returns AbortErrorかどうか、trueであればAbortError
 */
export const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";
