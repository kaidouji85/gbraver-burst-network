import { GuestAnonymousSDK } from "@gbraver-burst-network/anonymous-browser-sdk";

import {
  GUEST_ARMDOZER,
  GUEST_PILOT,
} from "./execute-battle/execute-guest-battle";
import { executeGuestBattle } from "./execute-battle/execute-guest-battle";
import { UseCase, UseCaseContext } from "./use-case";
import { waitTime } from "../wait-time";

/** ゲスト側プレイヤー */
export class GuestPlayer implements UseCase {
  /** ゲスト用匿名バックエンドSDK */
  #guestSDK: GuestAnonymousSDK;

  /**
   * コンストラクタ
   * @param guestSDK ゲスト用匿名バックエンドSDK
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
      armdozerId: GUEST_ARMDOZER,
      pilotId: GUEST_PILOT,
    });
    if (!battle) {
      console.log("Failed to join room");
      return;
    }

    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log("start battle", battle);
    await executeGuestBattle(battle);
    console.log("end battle");

    await waitTime(1000);
    battle.getRematchRoom()?.cancelRematch();
  }
}
