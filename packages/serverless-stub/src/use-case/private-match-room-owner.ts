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
      PilotIds.SHINYA,
    );
    console.log(room.roomID);
    const battle = await room.waitUntilMatching();
    const update01 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update01);
    const update02 = await battle.progress({
      type: "BURST_COMMAND",
    });
    console.log(update02);
    const update03 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update03);
    const update04 = await battle.progress({
      type: "PILOT_SKILL_COMMAND",
    });
    console.log(update04);
    const update05 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update05);
  }
}
