import { PrivateMatchRoom } from "@gbraver-burst-network/browser-core";
import {
  Battle,
  PrivateMatchRoomID,
} from "@gbraver-burst-network/browser-core/src";

import { privateMatchMakePolling } from "../websocket/private-match-make-polling";
import { BattleSDK } from "./battle-sdk";

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
    return new BattleSDK({
      player: resp.player,
      enemy: resp.enemy,
      initialState: resp.stateHistory,
      battleID: resp.battleID,
      initialFlowID: resp.flowID,
      isPoller: resp.isPoller,
      websocket: this.#websocket,
    });
  }
}
