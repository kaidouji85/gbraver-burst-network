import { parseJSON } from "../json/parse";
import {
  RoomCreationFailureSchema,
  RoomCreationSuccessSchema,
} from "./response/room-creation-result";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ルームを生成する
 * @param websocket WebSocketコネクション
 * @returns 成功したらルームID、失敗したらnull
 */
export const createRoom = (websocket: WebSocket): Promise<string | null> => {
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
    sendToWSSignal(websocket, { action: "create-room" });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
