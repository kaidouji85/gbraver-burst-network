// @flow

import {parsePingResp} from "./response";

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
      const response = (typeof e.data === 'string')
        ? parsePingResp(e.data)
        : null;
      response && resolve(response.message);
    };
    errorHandler = reject;
    websocket.addEventListener('message', handler);
    websocket.addEventListener('error', errorHandler);

    const data = {action: "ping"};
    websocket.send(JSON.stringify(data));
  })
    .finally(() => {
      handler && websocket.removeEventListener('message', handler);
      errorHandler && websocket.removeEventListener('error', errorHandler);
    });
}