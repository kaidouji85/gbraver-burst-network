import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase } from "./use-case";

/** プライベートマッチオーナー */
export class PrivateMatchRoomOwner implements UseCase {
  /** ブラウザSDK */
  #sdk: BrowserSDK;

  /**
   * コンストラクタ
   * @param sdk ブラウザSDK
   */
  constructor(sdk: Readonly<BrowserSDK>) {
    this.#sdk = sdk;
  }

  /** @override */
  name(): string {
    return "プライベートマッチ　オーナー";
  }

  /** @override */
  async execute(): Promise<void> {
    const room = await this.#sdk.createPrivateMatchRoom(
      ArmDozerIds.SHIN_BRAVER,
      PilotIds.SHINYA
    );
    console.log(room.roomID);
  }
}
