/**
 * WebRTCコネクションが接続されるまで待機する
 * @param connection WebRTCコネクション
 * @returns 接続されたら発火するPromise
 */
export const waitUntilConnected = (
  connection: RTCPeerConnection,
): Promise<void> => {
  let handler: (() => void) | null = null;
  return new Promise<void>((resolve) => {
    if (connection.connectionState === "connected") {
      resolve();
      return;
    }

    handler = () => {
      if (connection.connectionState === "connected") {
        resolve();
      }
    };
    connection.addEventListener("connectionstatechange", handler);
  }).finally(() => {
    if (handler) {
      connection.removeEventListener("connectionstatechange", handler);
    }
  });
};
