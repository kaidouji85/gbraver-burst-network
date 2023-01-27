import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { Resolve } from "../promise/promise";
import { CreatedPrivateMatchRoom } from "../response/created-private-match-room";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * プライベートマッチルームを生成する
 * @param websocket websocketクライアント
 * @param armdozerId 選択したアームドーザのID
 * @param pilotId 選択したパイロットのID
 * @return レスポンス
 */
export function createPrivateMatchRoom(
  websocket: WebSocket,
  armdozerId: ArmDozerId,
  pilotId: PilotId
): Promise<CreatedPrivateMatchRoom> {
  sendToAPIServer(websocket, {
    action: "create-private-match-room",
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<CreatedPrivateMatchRoom>) => {
      // TODO 実装する
    }
  );
}
