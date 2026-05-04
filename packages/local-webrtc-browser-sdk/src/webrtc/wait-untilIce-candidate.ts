/**
 * IceCandidateイベントが発生するまで待機する
 * @param connection 待機するコネクション
 * @returns IceCandidateイベント
 */
export const waitUntilIceCandidate = (
  connection: RTCPeerConnection,
): Promise<RTCIceCandidate[]> => {
  let handler: ((event: RTCPeerConnectionIceEvent) => void) | null = null;
  let candidates: RTCIceCandidate[] = [];
  return new Promise<RTCIceCandidate[]>((resolve) => {
    handler = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate === null) {
        resolve(candidates);
      } else {
        candidates = [...candidates, event.candidate];
      }
    };
    connection.addEventListener("icecandidate", handler);
  }).finally(() => {
    if (handler) {
      connection.removeEventListener("icecandidate", handler);
    }
  });
};
