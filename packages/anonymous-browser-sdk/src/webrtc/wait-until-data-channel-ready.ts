/**
 * データチャンネルが開通するのを待つ
 * @param dataChannel データチャンネル
 * @returns データチャンネルが開通したら発火するPromise
 */
export const waitUntilDataChannelOpen = (
  dataChannel: RTCDataChannel,
): Promise<void> => {
  let handler: (() => void) | null = null;
  return new Promise<void>((resolve) => {
    if (dataChannel.readyState === "open") {
      resolve();
      return;
    }

    handler = () => {
      if (dataChannel.readyState === "open") {
        resolve();
      }
    };

    dataChannel.addEventListener("open", handler);
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("open", handler);
    }
  });
};
