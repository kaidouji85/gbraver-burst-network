import { HostLocalWebRTCSDK } from "@gbraver-burst-network/local-webrtc-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase } from "./use-case";
import { waitTime } from "../wait-time";

/** ホスト側プレイヤー */
export class HostPlayer implements UseCase {
  /** ローカルWebRTCホスト用SDK */
  #hostSDK: HostLocalWebRTCSDK;

  /**
   * コンストラクタ
   * @param hostSDK ローカルWebRTCホスト用SDK
   */
  constructor(hostSDK: HostLocalWebRTCSDK) {
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
    const battle = await room.waitUntilMatching();
    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log("start battle", battle);
    const update01 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update01);
    await waitTime(1000);
    const update02 = await battle.progress({
      type: "BURST_COMMAND",
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
      type: "PILOT_SKILL_COMMAND",
    });
    console.log(update04);
    await waitTime(1000);
    const update05 = await battle.progress({
      type: "BATTERY_COMMAND",
      battery: 5,
    });
    console.log(update05);
    await waitTime(1000);

    console.log("end battle");
    this.#hostSDK.disconnectWebRTC();
    this.#hostSDK.disconnectWebSocket();
  }
}
