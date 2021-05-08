// @flow

import type {User} from "./user";
import type {PrepareBattleRoom} from "./battle-room";

/** カジュアルマッチ */
export interface CasualMatch {
  /**
   * カジュアルマッチにエントリする
   *
   * @param user エントリするユーザ
   * @return バトルルーム準備
   */
  enter(user: User): Promise<PrepareBattleRoom>;
}