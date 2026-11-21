import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import {
  EnterRematchRoom,
  EnterRematchRoomSchema,
} from "../guest/guest-message";

/**
 * ゲストからrematchRoomIDが一致した「EnterRematch」メッセージを待ち受ける
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.rematchRoomID 再戦ルームID
 * @param options.signal Promise強制終了用シグナル
 * @returns ゲストから送信されたEnterRematchRoomメッセージ
 */
export const receiveEnterRematchRoom = (
  options: {
    dataChannel: RTCDataChannel;
    rematchRoomID: string;
  } & Partial<SignalContainer>,
): Promise<EnterRematchRoom> => {
  const { dataChannel, rematchRoomID, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<EnterRematchRoom>((resolve, reject) => {
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
      const parsedEnterRematchRoom = EnterRematchRoomSchema.safeParse(data);
      if (
        parsedEnterRematchRoom.success &&
        parsedEnterRematchRoom.data.rematchRoomID === rematchRoomID
      ) {
        resolve(parsedEnterRematchRoom.data);
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
