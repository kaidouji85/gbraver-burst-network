import { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import {
  executePlayer01Battle,
  PLAYER_01_ARMDOZER,
  PLAYER_01_PILOT,
} from "./execute-battle/execute-player-01-battle";
import { UseCase } from "./use-case";

/** プライベートマッチオーナー（再戦あり） */
export class PrivateMatchRoomOwnerRematch implements UseCase {
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
    return "プライベートマッチ　オーナー（再戦あり）";
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
    console.log(
      "first battle",
      battle.player,
      battle.enemy,
      battle.initialState,
    );

    await executePlayer01Battle(battle);
    const rematchRoom = battle.getRematchRoom();
    if (!rematchRoom) {
      throw new Error("再戦ルームが存在しません");
    }

    rematchRoom.rematchCancelledNotifier().subscribe(() => {
      console.log("rematch cancelled");
    });
    const rematchBattle = await rematchRoom.requestRematch({
      armdozerId: PLAYER_01_ARMDOZER,
      pilotId: PLAYER_01_PILOT,
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
    await executePlayer01Battle(rematchBattle);
  }
}
