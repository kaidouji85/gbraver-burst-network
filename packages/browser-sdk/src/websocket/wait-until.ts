import type { SignalContainer } from "../abort-controller/signal-container";
import type { Reject, Resolve } from "../promise/promise";

/**
 * messageイベントハンドラ
 *
 * @template X resolveするデータの型
 * @param e messageイベント
 * @param resolve resolve関数
 * @param reject reject関数
 */
export type MessageHandler<X> = (
  e: MessageEvent,
  resolve: Resolve<X>,
  reject: Reject,
) => unknown;

/**
 * Websocketで特定メッセージを受信するまで待機する
 * 利用イメージは、コード例を参照
 *
 * waitUntil(websocket, (e, resolve, reject) => {
 *   const data = JSON.parse(e.data);
 *
 *   if (data.action === 'Success') {
 *     // 特定のメッセージを受信したら、resolveを呼び出して待機終了する
 *     // resolveの引数には外部に渡すオブジェクトを指定する
 *     resolve(data);
 *   }
 *
 *   if (data.action === 'Error') {
 *     // 例外を投げたい場合は、rejectを呼び出す
 *     // rejectの引数には、例外オブジェクトを指定できる
 *     reject(data);
 *   }
 * });
 *
 * @template X 本関数が返すデータ型
 * @param websocket messageイベントを処理するwebsocket
 * @param messageHandler messageイベントが発火した時のハンドラ
 * @param options オプション
 * @returns messageHandler内でresolveされたデータ
 */
export function waitUntil<X>(
  websocket: WebSocket,
  messageHandler: MessageHandler<X>,
  options?: Partial<SignalContainer>,
): Promise<X> {
  const signal = options?.signal;
  let handler: ((e: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<X>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };

    handler = (e: MessageEvent) => {
      messageHandler(e, resolve, reject);
    };

    signal?.addEventListener("abort", onAbort);
    websocket.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
}
