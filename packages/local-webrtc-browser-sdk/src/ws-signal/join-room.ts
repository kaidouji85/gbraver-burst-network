import { parseJSON } from "../json/parse";
import { Signal } from "../webrtc/signal";
import { JoinRoomRejectedSchema } from "./response/join-room-rejected";
import { MatchingSchema } from "./response/matching";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ルームに参加する
 * @param websocket WebSocketコネクション
 * @param roomID 参加するルームのID
 * @param sdp 自身のSDP
 * @param iceCandidates 自身のICE候補
 * @return ルームへの参加に成功したらSignal、失敗したらnull
 */
export const joinRoom = (options: {
  websocket: WebSocket;
  roomID: string;
  sdp: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
}): Promise<Signal | null> => {
  const { websocket, roomID, sdp, iceCandidates } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<Signal | null>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);

      const parsedMatching = MatchingSchema.safeParse(parsedData);
      if (parsedMatching.success) {
        const matching = parsedMatching.data;
        const { sdp, iceCandidates } = matching;
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
    sendToWSSignal(websocket, {
      action: "join-room",
      roomID,
      sdp,
      iceCandidates,
    });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
