import { PrivateMatchRoom } from "@gbraver-burst-network/browser-core";
import {
  Battle,
  PrivateMatchRoomID,
} from "@gbraver-burst-network/browser-core/src";

/** プライベートマッチSDK */
export class PrivateMatchRoomSDK implements PrivateMatchRoom {
  /** @override */
  roomID: PrivateMatchRoomID;

  /**
   * コンストラクタ
   * @param roomID ルームID
   */
  constructor(roomID: PrivateMatchRoomID) {
    this.roomID = roomID;
  }

  /** @override */
  async waitUntilMatching(): Promise<Battle> {
    return new Promise<Battle>(() => {
      // TODO 実装する
    });
  }
}
