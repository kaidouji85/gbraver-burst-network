import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** オフライン用ブラウザSDK */

export interface OfflineBrowserSDK {
  /**
   * 対戦ルームに入室する
   * @param options オプション
   * @param options.armdozerId アームドーザID
   * @param options.pilotId パイロットID
   */
  enterRoom(options: { armdozerId: ArmdozerId; pilotId: PilotId }): void;
}
