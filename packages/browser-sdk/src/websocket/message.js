// @flow

import type {Reject, Resolve} from "../promise/promise";

/**
 * messageイベントハンドラ
 *
 * @template X resolveするデータの型
 * @param e messageイベント
 * @param resolve resolve関数
 * @param reject reject関数
 */
export type MessageHandler<X> = (e: MessageEvent, resolve: Resolve<X>, reject: Reject) => void;

/**
 * Websocket messageイベントを処理する
 * 内部的にはエラーハンドリング、ハンドラの削除を行っている
 *
 * @param websocket messageイベントを処理するwebsocket
 * @param messageHandler messageイベントが発火した時のハンドラ
 * @return messageHandler内でresolveされたデータ
 */
export function onMessage<X>(websocket: WebSocket, messageHandler: MessageHandler<X>): Promise<X> {
  let handler = null;
  let errorHandler = null;
  return new Promise((resolve, reject) => {
    handler = (e: MessageEvent) => {
      messageHandler(e, resolve, reject);
    };
    errorHandler = reject;
    websocket.addEventListener('message', handler);
    websocket.addEventListener('error', errorHandler);
  })
    .finally(() => {
      handler && websocket.removeEventListener('message', handler);
      errorHandler && websocket.removeEventListener('error', errorHandler);
    });
}
