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
    const battle = await this.#guestSDK.joinRoom({
      roomID,
      armdozerId: ArmdozerIds.NEO_LANDOZER,
      pilotId: PilotIds.GAI,
    });
    if (!battle) {
      console.log("Failed to join room");
      return;
    }

    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log("start battle", battle);
    const update01 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 3,
    });
    console.log(update01);
    const update02 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update02);
    const update03 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update03);
    const update04 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 0,
    });
    console.log(update04);
    const update05 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 0,
    });
    console.log(update05);
  }
}
