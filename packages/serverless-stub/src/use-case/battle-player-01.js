// @flow

import type {UseCase} from "./use-case";
import {ArmDozerIdList, PilotIds} from 'gbraver-burst-core';
import type {BrowserSDK} from "@gbraver-burst-network/browser-sdk";

/** バトル プレイヤー01 */
export class BattlePlayer01 implements UseCase {
  _sdk: BrowserSDK

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
    return 'バトル プレイヤー01';
  }

  /** @override */
  async execute(): Promise<void> {
    const battle = await this._sdk.startCasualMatch(ArmDozerIdList.SHIN_BRAVER, PilotIds.SHINYA);
    battle.suddenlyBattleNotifier().subscribe(() => {
      console.log('suddenly battle end');
    });
    console.log(battle.player, battle.enemy, battle.initialState);
    const update01 = await battle.progress({type: 'BATTERY_COMMAND', battery: 5});
    console.log(update01);
    const update02 = await battle.progress({type: 'BURST_COMMAND'});
    console.log(update02);
    const update03 = await battle.progress({type: 'BATTERY_COMMAND', battery: 5});
    console.log(update03);
    const update04 = await battle.progress({type: 'PILOT_SKILL_COMMAND'});
    console.log(update04);
    const update05 = await battle.progress({type: 'BATTERY_COMMAND', battery: 5});
    console.log(update05);
  }

}