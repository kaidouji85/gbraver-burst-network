import { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import {
  JoinRoomAccepted,
  JoinRoomAcceptedSchema,
} from "./response/join-room-accepted";
import { JoinRoomRejectedSchema } from "./response/join-room-rejected";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ルームに参加する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.roomID 参加するルームのID
 * @param options.signal Promise強制終了用シグナル
 * @return ルームへの参加に成功したらJoinRoomAccepted、失敗したらnull
 */
export const joinRoom = (
  options: {
    websocket: WebSocket;
    roomID: string;
  } & Partial<SignalContainer>,
): Promise<JoinRoomAccepted | null> => {
  const { websocket, roomID, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<JoinRoomAccepted | null>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const parsedJoinRoomAccepted =
        JoinRoomAcceptedSchema.safeParse(parsedData);
      if (parsedJoinRoomAccepted.success) {
        resolve(parsedJoinRoomAccepted.data);
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

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
