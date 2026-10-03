import { BattleSDK, BrowserSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { UseCase, UseCaseContext } from "./use-case";

/** プライベートマッチ参加者（再戦あり） */
export class PrivateMatchRoomPlayerRematch implements UseCase {
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
    return "プライベートマッチ　参加者（再戦あり）";
  }

  /** @override */
  async execute(context: UseCaseContext): Promise<void> {
    const battle = await this.#sdk.enterPrivateMatchRoom(
      context.privateMatchRoomID,
      ArmdozerIds.NEO_LANDOZER,
      PilotIds.GAI,
    );
    if (!battle) {
      console.log("cloud not matching");
      return;
    }

    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(battle.player, battle.enemy, battle.initialState);

    await this.#executeBattle(battle);
    const rematchRoom = battle.getRematchRoom();
    if (!rematchRoom) {
      throw new Error("再戦ルームが存在しません");
    }

    const rematchBattle = await rematchRoom.requestRematch({
      armdozerId: ArmdozerIds.NEO_LANDOZER,
      pilotId: PilotIds.GAI,
    });
    await this.#executeBattle(rematchBattle);
  }

  /**
   * バトルを実行するヘルパーメソッド
   * 本メソッドではバトル終了確認をしていないが、
   * バトル終了になるようにゲーム進行することを確認している
   * @param battle バトルSDK
   * @returns バトルが完了したら発火するPromise
   */
  async #executeBattle(battle: BattleSDK) {
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
