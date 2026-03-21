import { parseJSON } from "../../json/parse";
import { RequestSelectedPlayerSchema } from "../host/host-message";

/**
 * ホストから「RequestSelectedPlayer」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @returns フローID
 */
export const waitRequestSelectedPlayer = (
  dataChannel: RTCDataChannel,
): Promise<string> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<string>((resolve) => {
    handler = (event) => {
      const data = parseJSON(event.data);
      const parsedRequestSelectedPlayer =
        RequestSelectedPlayerSchema.safeParse(data);
      if (parsedRequestSelectedPlayer.success) {
        const { flowID } = parsedRequestSelectedPlayer.data;
        resolve(flowID);
      }
    };
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("message", handler);
    }
  });
};
