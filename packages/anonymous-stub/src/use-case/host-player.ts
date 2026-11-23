import { HostAnonymousSDK } from "@gbraver-burst-network/anonymous-browser-sdk";

import {
  executeHostBattle,
  HOST_ARMDOZER,
  HOST_PILOT,
} from "./execute-battle/execute-host-battle";
import { UseCase } from "./use-case";
import { waitTime } from "../wait-time";

/** ホスト側プレイヤー */
export class HostPlayer implements UseCase {
  /** ホスト用匿名バックエンドSDK */
  #hostSDK: HostAnonymousSDK;

  /**
   * コンストラクタ
   * @param hostSDK ホスト用匿名バックエンドSDK
   */
  constructor(hostSDK: HostAnonymousSDK) {
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
      armdozerId: HOST_ARMDOZER,
      pilotId: HOST_PILOT,
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
    await executeHostBattle(battle);
    console.log("end battle");

    await waitTime(1000);
    battle.getRematchRoom()?.cancelRematch();
  }
}
