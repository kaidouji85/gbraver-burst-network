import { parseJSON } from "../../json/parse";
import {
  RequestSelectedPlayer,
  RequestSelectedPlayerSchema,
} from "../host/host-message";

/**
 * ホストから「RequestSelectedPlayer」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @returns フローID
 */
export const waitRequestSelectedPlayer = (
  dataChannel: RTCDataChannel,
): Promise<RequestSelectedPlayer> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<RequestSelectedPlayer>((resolve) => {
    handler = (event) => {
      const data = parseJSON(event.data);
      const parsedRequestSelectedPlayer =
        RequestSelectedPlayerSchema.safeParse(data);
      if (parsedRequestSelectedPlayer.success) {
        resolve(parsedRequestSelectedPlayer.data);
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
