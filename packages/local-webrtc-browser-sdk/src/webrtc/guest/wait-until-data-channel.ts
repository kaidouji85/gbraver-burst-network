/**
 * ゲスト側でデータチャネルが開通するのを待つ
 * @param connection ホスト側のWebRTCコネクション
 * @returns 開通したデータチャネル
 */
export const waitUntilDataChannel = (
  connection: RTCPeerConnection,
): Promise<RTCDataChannel> =>
  new Promise((resolve) => {
    connection.addEventListener(
      "datachannel",
      (event) => {
        resolve(event.channel);
      },
      { once: true },
    );
  });
