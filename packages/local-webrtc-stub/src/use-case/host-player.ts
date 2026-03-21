import { LocalWebRTCHostSDK } from "@gbraver-burst-network/local-webrtc-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase } from "./use-case";

/** ホスト側プレイヤー */
export class HostPlayer implements UseCase {
  /** ローカルWebRTCホスト用SDK */
  #hostSDK: LocalWebRTCHostSDK;

  /**
   * コンストラクタ
   * @param hostSDK ローカルWebRTCホスト用SDK
   */
  constructor(hostSDK: LocalWebRTCHostSDK) {
    this.#hostSDK = hostSDK;
  }

  /** @override */
  name(): string {
    return "ホスト側プレイヤー";
  }

  /** @override */
  async execute(): Promise<void> {
    console.log("start create room");
    const room = await this.#hostSDK.createRoom({
      armdozerId: ArmdozerIds.SHIN_BRAVER,
      pilotId: PilotIds.SHINYA,
    });
    if (room === null) {
      console.error("create room failed");
      return;
    }

    console.log("create room success, roomID:", room.roomID);
    const guestSignal = await room.waitUntilMatching();
    console.log("matching success, guestSignal:", guestSignal);
  }
}
