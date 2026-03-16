import { parseJSON } from "../json/parse";
import { Signal } from "../webrtc/signal";
import { JoinRoomAcceptedSchema } from "./response/join-room-accepted";
import { JoinRoomRejectedSchema } from "./response/join-room-rejected";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ルームに参加する
 * @param websocket WebSocketコネクション
 * @param roomID 参加するルームのID
 * @return ルームへの参加に成功したらSignal、失敗したらnull
 */
export const joinRoom = (options: {
  websocket: WebSocket;
  roomID: string;
}): Promise<Signal | null> => {
  const { websocket, roomID } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<Signal | null>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);

      const parsedJoinRoomAccepted =
        JoinRoomAcceptedSchema.safeParse(parsedData);
      if (parsedJoinRoomAccepted.success) {
        const joinRoomAccepted = parsedJoinRoomAccepted.data;
        const { sdp, iceCandidates } = joinRoomAccepted;
        resolve({ sdp, iceCandidates });
        return;
      }

      const parsedJoinRoomRejected =
        JoinRoomRejectedSchema.safeParse(parsedData);
      if (parsedJoinRoomRejected.success) {
        resolve(null);
        return;
      }
    };
    websocket.addEventListener("message", handler);
    sendToWSSignal(websocket, { action: "join-room", roomID });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
