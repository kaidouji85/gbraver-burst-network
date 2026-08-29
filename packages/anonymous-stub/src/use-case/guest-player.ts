import { GuestAnonymousSDK } from "@gbraver-burst-network/anonymous-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { waitTime } from "../wait-time";
import { UseCase, UseCaseContext } from "./use-case";

/** ゲスト側プレイヤー */
export class GuestPlayer implements UseCase {
  /** ローカルWebRTCゲスト用SDK */
  #guestSDK: GuestAnonymousSDK;

  /**
   * コンストラクタ
   * @param guestSDK ローカルWebRTCゲスト用SDK
   */
  constructor(guestSDK: GuestAnonymousSDK) {
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
    await waitTime(1000);
    const update02 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update02);
    await waitTime(1000);
    const update03 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update03);
    await waitTime(1000);
    const update04 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 0,
    });
    console.log(update04);
    await waitTime(1000);
    const update05 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 0,
    });
    console.log(update05);
    await waitTime(1000);

    console.log("end battle");
    this.#guestSDK.disconnectWebRTC();
    this.#guestSDK.disconnectWebSocket();
  }
}
