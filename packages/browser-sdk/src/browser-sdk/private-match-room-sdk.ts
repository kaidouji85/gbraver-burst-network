import { PrivateMatchRoom } from "@gbraver-burst-network/browser-core";
import {
  Battle,
  PrivateMatchRoomID,
} from "@gbraver-burst-network/browser-core/src";

import { privateMatchMakePolling } from "../websocket/private-match-make-polling";
import { createBattleSDKFromBattleStart } from "./create-battle-sdk-from-battle-start";

/** プライベートマッチSDK */
export class PrivateMatchRoomSDK implements PrivateMatchRoom {
  /** @override */
  roomID: PrivateMatchRoomID;
  /** websocketクライアント */
  #websocket: WebSocket;

  /**
   * コンストラクタ
   * @param roomID ルームID
   * @param websocket websocketクライアント
   */
  constructor(roomID: PrivateMatchRoomID, websocket: WebSocket) {
    this.roomID = roomID;
    this.#websocket = websocket;
  }

  /** @override */
  async waitUntilMatching(): Promise<Battle> {
    const resp = await privateMatchMakePolling(this.#websocket, this.roomID);
    return createBattleSDKFromBattleStart(resp, this.#websocket);
  }
}
