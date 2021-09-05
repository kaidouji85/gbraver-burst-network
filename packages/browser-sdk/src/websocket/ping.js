// @flow

import {onMessage} from "./message";
import type {Resolve} from "../promise/promise";
import {parseJSON} from "../json/parse";
import type {Pong} from "../response/pong";
import {parsePong} from "../response/pong";
import {sendToAPIServer} from "./send-to-api-server";

/**
 * API サーバへの疎通確認
 *
 * @param websocket websocketクライアント
 * @return APIサーバからの返答内容
 */
export function ping(websocket: WebSocket): Promise<Pong> {
  sendToAPIServer(websocket, {action: 'ping'});
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<Pong>): void => {
    const data = parseJSON(e.data);
    const response = parsePong(data);
    response && resolve(response);
  });
}