import { GameState } from "gbraver-burst-core";

import { RematchRoomID } from "../core/matching/rematch/rematch-room";

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";
  /** 更新されたゲームステート */
  update: GameState[];
  /** 再戦ルームID */
  rematchRoomID: RematchRoomID;
};
