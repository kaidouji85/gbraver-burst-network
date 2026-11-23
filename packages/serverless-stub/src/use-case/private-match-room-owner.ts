import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import {
  executePlayer01Battle,
  PLAYER_01_ARMDOZER,
  PLAYER_01_PILOT,
} from "./execute-battle/execute-player-01-battle";
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
      PLAYER_01_ARMDOZER,
      PLAYER_01_PILOT,
    );
    console.log(room.roomID);
    const battle = await room.waitUntilMatching();
    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(battle.player, battle.enemy, battle.initialState);

    await executePlayer01Battle(battle);
  }
}
