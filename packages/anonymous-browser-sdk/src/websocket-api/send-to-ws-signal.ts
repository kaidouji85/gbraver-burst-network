import { WSSignalRequest } from "./request";

/**
 * WebSocketシグナルサーバーにメッセージ送信をする
 * @param websocket WebSocketコネクション
 * @param data 送信内容
 */
export function sendToWSSignal(
  websocket: WebSocket,
  data: WSSignalRequest,
): void {
  websocket.send(JSON.stringify(data));
}
