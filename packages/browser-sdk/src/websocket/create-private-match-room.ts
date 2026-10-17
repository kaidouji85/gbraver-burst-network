import { ArmdozerId, PilotId } from "gbraver-burst-core";

import type { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import { Resolve } from "../promise/promise";
import {
  CreatedPrivateMatchRoom,
  parseCreatedPrivateMatchRoom,
} from "../response/created-private-match-room";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * プライベートマッチルームを生成する
 * @param websocket websocketクライアント
 * @param armdozerId 選択したアームドーザのID
 * @param pilotId 選択したパイロットのID
 * @param options オプション
 * @returns レスポンス
 */
export function createPrivateMatchRoom(
  websocket: WebSocket,
  armdozerId: ArmdozerId,
  pilotId: PilotId,
  options?: Partial<SignalContainer>,
): Promise<CreatedPrivateMatchRoom> {
  const signal = options?.signal;
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  sendToAPIServer(websocket, {
    action: "create-private-match-room",
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<CreatedPrivateMatchRoom>) => {
      const data = parseJSON(e.data);
      const response = parseCreatedPrivateMatchRoom(data);
      if (response) {
        resolve(response);
      }
    },
    options,
  );
}
