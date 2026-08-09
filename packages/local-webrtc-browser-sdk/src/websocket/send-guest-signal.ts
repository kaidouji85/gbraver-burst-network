import { parseJSON } from "../json/parse";
import { SendGuestSignalAcceptedSchema } from "./response/send-guest-signal-accepted";
import { SendGuestSignalRejectedSchema } from "./response/send-guest-signal-rejected";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * ゲストのシグナルを送信する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.roomID 参加するルームのID
 * @param options.reservationID 予約ID
 * @param options.sdp ゲストのSDP
 * @param options.iceCandidates ゲストのICE候補
 * @return ゲストのシグナルの送信に成功したらtrue、失敗したらfalse
 */
export const sendGuestSignal = (options: {
  websocket: WebSocket;
  roomID: string;
  reservationID: string;
  sdp: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
}): Promise<boolean> => {
  const { websocket, roomID, reservationID, sdp, iceCandidates } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<boolean>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const parsedSendGuestSignalAccepted =
        SendGuestSignalAcceptedSchema.safeParse(parsedData);
      if (parsedSendGuestSignalAccepted.success) {
        resolve(true);
        return;
      }

      const parsedSendGuestSignalRejected =
        SendGuestSignalRejectedSchema.safeParse(parsedData);
      if (parsedSendGuestSignalRejected.success) {
        resolve(false);
        return;
      }
    };
    websocket.addEventListener("message", handler);
    sendToWSSignal(websocket, {
      action: "send-guest-signal",
      roomID,
      reservationID,
      sdp,
      iceCandidates,
    });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
