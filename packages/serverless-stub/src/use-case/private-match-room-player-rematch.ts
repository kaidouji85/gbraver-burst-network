import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import {
  executePlayer02Battle,
  PLAYER_02_ARMDOZER,
  PLAYER_02_PILOT,
} from "./execute-battle/execute-player-02-battle";
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
      PLAYER_02_ARMDOZER,
      PLAYER_02_PILOT,
    );
    if (!battle) {
      console.log("cloud not matching");
      return;
    }

    battle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(
      "first battle",
      battle.player,
      battle.enemy,
      battle.initialState,
    );

    await executePlayer02Battle(battle);
    const rematchRoom = battle.getRematchRoom();
    if (!rematchRoom) {
      throw new Error("再戦ルームが存在しません");
    }

    rematchRoom.rematchCancelledNotifier().subscribe(() => {
      console.log("rematch cancelled");
    });
    const rematchBattle = await rematchRoom.requestRematch({
      armdozerId: PLAYER_02_ARMDOZER,
      pilotId: PLAYER_02_PILOT,
    });
    rematchBattle.suddenlyBattleEndNotifier().subscribe(() => {
      console.log("suddenly battle end");
    });
    console.log(
      "rematch battle",
      rematchBattle.player,
      rematchBattle.enemy,
      rematchBattle.initialState,
    );
    await executePlayer02Battle(rematchBattle);
  }
}
