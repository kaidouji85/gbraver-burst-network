/** ICE Candidateの収集結果 */
type Result = {
  /** 収集したICE Candidate */
  iceCandidates: RTCIceCandidate[];
  /** 発生したICE Candidateのエラー */
  iceCandidateErrors: string[];
};

/**
 * すべてのICE Candidateが収集する
 * @param connection 待機するコネクション
 * @returns 収集結果
 */
export const gatherAllIceCandidates = (
  connection: RTCPeerConnection,
): Promise<Result> => {
  let icecandidateHandler: ((event: RTCPeerConnectionIceEvent) => void) | null =
    null;
  let icecandidateErrorHandler:
    ((event: RTCPeerConnectionIceErrorEvent) => void) | null = null;
  let candidates: RTCIceCandidate[] = [];
  let iceCandidateErrors: string[] = [];

  return new Promise<Result>((resolve) => {
    icecandidateHandler = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate === null) {
        resolve({ iceCandidates: candidates, iceCandidateErrors });
      } else {
        candidates = [...candidates, event.candidate];
      }
    };

    icecandidateErrorHandler = (event: RTCPeerConnectionIceErrorEvent) => {
      iceCandidateErrors = [...iceCandidateErrors, event.errorText];
    };

    connection.addEventListener("icecandidate", icecandidateHandler);
    connection.addEventListener("icecandidateerror", icecandidateErrorHandler);
  }).finally(() => {
    if (icecandidateHandler) {
      connection.removeEventListener("icecandidate", icecandidateHandler);
    }
    if (icecandidateErrorHandler) {
      connection.removeEventListener(
        "icecandidateerror",
        icecandidateErrorHandler,
      );
    }
  });
};
