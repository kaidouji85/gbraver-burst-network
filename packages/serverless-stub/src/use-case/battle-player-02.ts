import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import {
  executePlayer02Battle,
  PLAYER_02_ARMDOZER,
  PLAYER_02_PILOT,
} from "./execute-battle/execute-player-02-battle";
import type { UseCase } from "./use-case";

/** バトル プレイヤー02 */
export class BattlePlayer02 implements UseCase {
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
    return "バトル プレイヤー02";
  }

  /** @override */
  async execute(): Promise<void> {
    const battle = await this._sdk.startCasualMatch(
      PLAYER_02_ARMDOZER,
      PLAYER_02_PILOT,
    );
    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(battle.player, battle.enemy, battle.initialState);
    await executePlayer02Battle(battle);
  }
}
