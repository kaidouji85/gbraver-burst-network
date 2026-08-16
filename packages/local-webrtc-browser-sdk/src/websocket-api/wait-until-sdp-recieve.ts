import { parseJSON } from "../json/parse";
import { ReceiveRemoteSDPSchema } from "./response/receive-remote-sdp";
import { SendSDPRejectedSchema } from "./response/send-sdp-rejected";

/**
 * 相手からSDPを受信するまで待機する
 * @param websocket WebSocketコネクション
 * @returns 受信したSDP
 */
export const waitUntilSDPReceive = (
  websocket: WebSocket,
): Promise<RTCSessionDescriptionInit> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<RTCSessionDescriptionInit>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const remoteSDP = ReceiveRemoteSDPSchema.safeParse(parsedData);
      if (remoteSDP.success) {
        resolve(remoteSDP.data.sdp);
      }

      const sendSDPRejected = SendSDPRejectedSchema.safeParse(parsedData);
      if (sendSDPRejected.success) {
        throw new Error("send sdp rejected");
      }
    };
    websocket.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
