/**
 * WebRTCコネクションが接続されるまで待機する
 * @param connection WebRTCコネクション
 * @returns 接続されたら発火するPromise
 */
export const waitUntilConnected = (
  connection: RTCPeerConnection,
): Promise<void> => {
  let hander: (() => void) | null = null;
  return new Promise<void>((resolve) => {
    if (connection.connectionState === "connected") {
      resolve();
      return;
    }

    hander = () => {
      if (connection.connectionState === "connected") {
        resolve();
      }
    };
    connection.addEventListener("connectionstatechange", hander);
  }).finally(() => {
    if (hander) {
      connection.removeEventListener("connectionstatechange", hander);
    }
  });
};
