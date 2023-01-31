import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmDozerIds, PilotIds } from "gbraver-burst-core";
import { UseCase } from "./use-case";

/** プライベートマッチ　参加者 */
export class PrivateMatchRoomPlayer implements UseCase {
  /** ブラウザSDK */
  #sdk: BrowserSDK;
  /** プライベートマッチルームID */
  #roomID: string;

  /**
   * コンストラクタ
   * @param sdk ブラウザSDK
   */
  constructor(sdk: Readonly<BrowserSDK>, roomID: string) {
    this.#sdk = sdk;
    this.#roomID = roomID;
  }

  /** @override */
  name(): string {
    return "プライベートマッチ　参加者";
  }

  /** @override */
  async execute(): Promise<void> {
    const battle = await this.#sdk.enterPrivateMatchRoom(this.#roomID, ArmDozerIds.NEO_LANDOZER, PilotIds.GAI);
    if (!battle) {
      console.log("cloud not matching");
      return;
    }
  }
}