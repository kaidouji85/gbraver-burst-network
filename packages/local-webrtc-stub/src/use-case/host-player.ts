import { LocalWebRTCHostSDK } from "@gbraver-burst-network/local-webrtc-browser-sdk";

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
    const roomID = await this.#hostSDK.createRoom();
    if (roomID === null) {
      console.error("create room failed");
      return;
    }

    console.log("create room success, roomID:", roomID);
  }
}
