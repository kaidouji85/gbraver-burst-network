import { filter, fromEvent, map, merge, Observable } from "rxjs";

/**
 * iceConnectionがdisconnected状態になったことを通知するObservableを返す
 * @param connection WebRTCコネクション
 * @returns disconnected状態になったことを通知するObservable
 */
export const notifyDisconnected = (
  connection: RTCPeerConnection,
): Observable<unknown> =>
  merge(
    fromEvent(connection, "iceconnectionstatechange").pipe(
      map(() => connection.iceConnectionState),
    ),
  ).pipe(filter((state) => state === "disconnected"));
