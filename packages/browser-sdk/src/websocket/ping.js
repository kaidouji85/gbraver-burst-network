// @flow

import {parsePingResponse} from "./response";
import {onMessage} from "./message";
import type {Resolve} from "../promise/promise";
import {parseJSON} from "../json/parse";
import type {PingResponse} from "./response";

/**
 * API サーバへの疎通確認
 *
 * @param websocket websocketクライアント
 * @return APIサーバからの返答内容
 */
export function ping(websocket: WebSocket): Promise<PingResponse> {
  websocket.send(JSON.stringify({action: 'ping'}));
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<PingResponse>): void => {
    const data = parseJSON(e.data);
    const response = parsePingResponse(data);
    response && resolve(response);
  });
}