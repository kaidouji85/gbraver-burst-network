// @flow

import {parsePingResponse} from "./response";
import {onMessage} from "./message";
import type {Resolve} from "../promise/promise";
import {parseJSON} from "../json/parse";

/**
 * API サーバへの疎通確認
 *
 * @param websocket websocketクライアント
 * @return APIサーバからの返答内容
 */
export function ping(websocket: WebSocket): Promise<string> {
  websocket.send(JSON.stringify({action: 'ping'}));
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<string>): void => {
    const data = parseJSON(e.data);
    const response = parsePingResponse(data);
    response && resolve(response.message);
  });
}