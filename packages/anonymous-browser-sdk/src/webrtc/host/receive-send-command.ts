import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { SendCommand, SendCommandSchema } from "../guest/guest-message";

/**
 * ゲストからflowIDが一致した「SendCommand」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @param flowID フローID
 * @param options オプション
 * @param options.signal Promise強制終了用シグナル
 * @returns フローID
 */
export const receiveSendCommand = (
  dataChannel: RTCDataChannel,
  flowID: string,
  options?: Partial<SignalContainer>,
): Promise<SendCommand> => {
  const signal = options?.signal;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<SendCommand>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    handler = (event) => {
      const data = parseJSON(event.data);
      const parsedSendCommand = SendCommandSchema.safeParse(data);
      if (
        parsedSendCommand.success &&
        parsedSendCommand.data.flowID === flowID
      ) {
        resolve(parsedSendCommand.data);
        return;
      }
    };
    dataChannel.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("message", handler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
