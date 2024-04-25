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
 * @returns messageHandler内でresolveされたデータ
 */
export function waitUntil<X>(
  websocket: WebSocket,
  messageHandler: MessageHandler<X>,
): Promise<X> {
  let handler: ((e: MessageEvent) => void) | null = null;
  return new Promise<X>((resolve, reject) => {
    handler = (e: MessageEvent) => {
      messageHandler(e, resolve, reject);
    };

    websocket.addEventListener("message", handler);
  }).finally(() => {
    handler && websocket.removeEventListener("message", handler);
  });
}
