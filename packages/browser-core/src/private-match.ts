import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { Battle } from "./battle";

/** プライベートマッチルーム生成 */
export interface PrivateMatchCreate {
  /**
   * プライベートマッチルームを生成する
   * @param armdozerId 選択したアームドーザのID
   * @param pilotId 選択したパイロットのID
   * @return 生成したプライベートマッチルームのID
   */
  createPrivateMatchRoom(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<PrivateMatchRoom>;
}

/** プライベートマッチルームID */
export type PrivateMatchRoomID = string;

/** プライベートマッチルーム */
export interface PrivateMatchRoom {
  /** ルームID、本プロパティを招待するユーザに共有する */
  roomID: PrivateMatchRoomID;

  /**
   * マッチングが成立するまで待機する
   * @return バトル
   */
  waitUntilMatching(): Promise<Battle>;
}
