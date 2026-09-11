import { filter, fromEvent, map, merge, Observable } from "rxjs";

/**
 * コネクションがfailed状態になったことを通知するObservableを返す
 * @param connection WebRTCコネクション
 * @returns failed状態になったことを通知するObservable
 */
export const notifyConnectionFailed = (
  connection: RTCPeerConnection,
): Observable<unknown> =>
  merge(
    fromEvent(connection, "connectionstatechange").pipe(
      map(() => connection.connectionState),
    ),
    fromEvent(connection, "iceconnectionstatechange").pipe(
      map(() => connection.iceConnectionState),
    ),
  ).pipe(filter((state) => state === "failed"));
