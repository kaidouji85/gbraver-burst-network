/**
 * AbortErrorを生成する
 * 本関数で生成する例外はfetchのAbortSignalがabortされた際に発生するものを模倣している
 * @param message エラーメッセージ
 * @returns AbortError
 */
export const createAbortError = (message: string) =>
  new DOMException(message, "AbortError");
