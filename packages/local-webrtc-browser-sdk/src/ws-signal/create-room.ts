import { parseJSON } from "../json/parse";
import {
  RoomCreationFailureSchema,
  RoomCreationSuccessSchema,
} from "./response/room-creation-result";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ルームを生成する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.sdp ホストのSDP
 * @param options.iceCandidates ホストのICE候補
 * @returns 成功したらルームID、失敗したらnull
 */
export const createRoom = (options: {
  websocket: WebSocket;
  sdp: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
}): Promise<string | null> => {
  const { websocket, sdp, iceCandidates } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<string | null>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);

      const parsedRoomCreationSuccessSchema =
        RoomCreationSuccessSchema.safeParse(parsedData);
      if (parsedRoomCreationSuccessSchema.success) {
        const roomCreationSuccess = parsedRoomCreationSuccessSchema.data;
        resolve(roomCreationSuccess.roomID);
        return;
      }

      const parsedRoomCreationFailure =
        RoomCreationFailureSchema.safeParse(parsedData);
      if (parsedRoomCreationFailure.success) {
        resolve(null);
        return;
      }
    };
    websocket.addEventListener("message", handler);
    sendToWSSignal(websocket, { action: "create-room", sdp, iceCandidates });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
