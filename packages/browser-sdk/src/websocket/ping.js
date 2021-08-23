// @flow

/**
 * API サーバへの疎通確認
 *
 * @param websocket websocketクライアント
 * @return APIサーバからの返答内容
 */
export function ping(websocket: WebSocket): Promise<string> {
  let handler = null;
  let errorHandler = null;
  return new Promise((resolve, reject) => {
    handler = (e: MessageEvent) => {
      console.log(e.data);
      resolve('hello'); // TODO データから値を取得する
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