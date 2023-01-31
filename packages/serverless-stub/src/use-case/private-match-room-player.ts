import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase, UseCaseContext } from "./use-case";

/** プライベートマッチ参加者 */
export class PrivateMatchRoomPlayer implements UseCase {
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
    return "プライベートマッチ　参加者";
  }

  /** @override */
  async execute(context: UseCaseContext): Promise<void> {
    const battle = await this.#sdk.enterPrivateMatchRoom(
      context.privateMatchRoomID,
      ArmDozerIds.NEO_LANDOZER,
      PilotIds.GAI
    );
    if (!battle) {
      console.log("cloud not matching");
      return;
    }
  }
}
