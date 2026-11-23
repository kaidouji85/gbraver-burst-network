import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import {
  executePlayer01Battle,
  PLAYER_01_ARMDOZER,
  PLAYER_01_PILOT,
} from "./execute-battle/execute-player-01-battle";
import type { UseCase } from "./use-case";

/** バトル プレイヤー01 */
export class BattlePlayer01 implements UseCase {
  _sdk: BrowserSDK;

  /**
   * コンストラクタ
   *
   * @param sdk ブラウザSDK
   */
  constructor(sdk: BrowserSDK) {
    this._sdk = sdk;
  }

  /** @override */
  name(): string {
    return "バトル プレイヤー01";
  }

  /** @override */
  async execute(): Promise<void> {
    const battle = await this._sdk.startCasualMatch(
      PLAYER_01_ARMDOZER,
      PLAYER_01_PILOT,
    );
    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(battle.player, battle.enemy, battle.initialState);
    await executePlayer01Battle(battle);
  }
}
