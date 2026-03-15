import { LocalWebRTCBrowserSDK } from "@gbraver-burst-network/local-webrtc-browser-sdk";

import { UseCase, UseCaseContext } from "./use-case";

/** ホスト側プレイヤー */
export class HostPlayer implements UseCase {
  //#hostSDK: LocalWebRTCBrowserSDK;

  /** @override */
  name(): string {
    return "ホスト側プレイヤー";
  }

  /** @override */
  async execute(context: UseCaseContext): Promise<void> {
    console.log("ホスト側プレイヤーを実行", context);
  }
}
