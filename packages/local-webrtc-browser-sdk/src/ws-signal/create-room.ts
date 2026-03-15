import { parseJSON } from "../json/parse";
import {
  RoomCreationFailureSchema,
  RoomCreationSuccessSchema,
} from "./response/room-creation-result";

/**
 * ルームを生成する
 * @param websocket WebSocketコネクション
 * @returns 成功したらルームID、失敗したらnull
 */
export const createRoom = (websocket: WebSocket) =>
  new Promise<string | null>((resolve) => {
    websocket.addEventListener("message", (event) => {
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
    });
  });
