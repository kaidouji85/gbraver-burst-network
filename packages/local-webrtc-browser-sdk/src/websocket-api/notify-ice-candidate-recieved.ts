import { filter, fromEvent, map, Observable } from "rxjs";

import { parseJSON } from "../json/parse";
import { ReceiveICECandidateSchema } from "./response/recieve-ice-candidate";

/**
 * ICE candidate を受信したことを通知する
 * @param websocket WebSocketコネクション
 * @returns 通知ストリーム
 */
export const notifyIceCandidateReceived = (
  websocket: WebSocket,
): Observable<RTCIceCandidateInit> =>
  fromEvent<MessageEvent>(websocket, "message").pipe(
    map((event) => parseJSON(event.data)),
    map((data) => ReceiveICECandidateSchema.safeParse(data)),
    filter((data) => data.success),
    map((data) => data.data.iceCandidate),
  );
