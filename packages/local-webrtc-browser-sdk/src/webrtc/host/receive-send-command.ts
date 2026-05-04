import { parseJSON } from "../../json/parse";
import { SendCommand, SendCommandSchema } from "../guest/guest-message";

/**
 * ゲストからflowIDが一致した「SendCommand」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @param flowID フローID
 * @returns フローID
 */
export const receiveSendCommand = (
  dataChannel: RTCDataChannel,
  flowID: string,
): Promise<SendCommand> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<SendCommand>((resolve) => {
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
  });
};
