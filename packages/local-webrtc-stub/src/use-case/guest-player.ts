import { LocalWebRTCGuestSDK } from "@gbraver-burst-network/local-webrtc-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase, UseCaseContext } from "./use-case";

/** ゲスト側プレイヤー */
export class GuestPlayer implements UseCase {
  /** ローカルWebRTCゲスト用SDK */
  #guestSDK: LocalWebRTCGuestSDK;

  /**
   * コンストラクタ
   * @param guestSDK ローカルWebRTCゲスト用SDK
   */
  constructor(guestSDK: LocalWebRTCGuestSDK) {
    this.#guestSDK = guestSDK;
  }

  /** @override */
  name(): string {
    return "ゲスト側プレイヤー";
  }

  /** @override */
  async execute(context: UseCaseContext): Promise<void> {
    const { roomID } = context;
    console.log("start join room, roomID:", roomID);
    const isJoined = await this.#guestSDK.joinRoom({
      roomID,
      armdozerId: ArmdozerIds.NEO_LANDOZER,
      pilotId: PilotIds.GAI,
    });
    console.log("join room result:", isJoined);
  }
}
