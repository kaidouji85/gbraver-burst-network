import { filter, fromEvent, map, Observable } from "rxjs";

import { parseJSON } from "../../json/parse";
import {
  HostCancelRematch,
  HostCancelRematchSchema,
} from "../host/host-message";

/**
 * ホストからの再戦キャンセルを通知する
 * 引数で指定したルームIDが一致した場合に通知され、それ以外は無視する
 * @param options オプション
 * @param options.rematchRoomID 再戦ルームID
 * @param options.dataChannel データチャンネル
 * @returns ホストからの再戦キャンセル通知
 */
export const notifyHostRematchCancel = (options: {
  rematchRoomID: string;
  dataChannel: RTCDataChannel;
}): Observable<HostCancelRematch> => {
  const { rematchRoomID, dataChannel } = options;
  return fromEvent<MessageEvent>(dataChannel, "message").pipe(
    map((event) => parseJSON(event.data)),
    map((parsedJson) => HostCancelRematchSchema.safeParse(parsedJson)),
    filter((result) => result.success),
    map((result) => result.data),
    filter((data) => data.rematchRoomID === rematchRoomID),
  );
};
