import { SignalContainer } from "../abort-controller/signal-container";

/**
 * ICE Candidateの収集中に発生したエラーのメッセージを作成する
 * @param error ICE Candidateの収集中に発生したエラー
 * @returns エラーメッセージ
 */
export const createICECandidateErrorMessage = (
  error: RTCPeerConnectionIceErrorEvent,
) => `${error.errorCode} ${error.url} ${error.errorText}`;

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
 * @param options オプション
 * @param options.signal Promise強制終了用シグナル
 * @returns 収集結果
 */
export const gatherAllIceCandidates = (
  connection: RTCPeerConnection,
  options?: Partial<SignalContainer>,
): Promise<Result> => {
  const signal = options?.signal;
  let icecandidateHandler: ((event: RTCPeerConnectionIceEvent) => void) | null =
    null;
  let icecandidateErrorHandler:
    ((event: RTCPeerConnectionIceErrorEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  let candidates: RTCIceCandidate[] = [];
  let iceCandidateErrors: string[] = [];

  return new Promise<Result>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    icecandidateHandler = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate === null) {
        resolve({ iceCandidates: candidates, iceCandidateErrors });
      } else {
        candidates = [...candidates, event.candidate];
      }
    };

    icecandidateErrorHandler = (event: RTCPeerConnectionIceErrorEvent) => {
      const errorMessage = createICECandidateErrorMessage(event);
      iceCandidateErrors = [...iceCandidateErrors, errorMessage];
    };

    connection.addEventListener("icecandidate", icecandidateHandler);
    connection.addEventListener("icecandidateerror", icecandidateErrorHandler);
  }).finally(() => {
    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
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
