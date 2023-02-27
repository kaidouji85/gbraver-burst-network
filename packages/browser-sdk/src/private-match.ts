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

/** プライベートマッチルーム入室 */
export interface PrivateMatchRoomEnter {
  /**
   * プライベートマッチルームに入室する
   * マッチングに選ばれた場合はBattleを返すが、選ばれなかった場合はnullを返す
   * @param private 入室するルームのID
   * @param armdozerId 選択したアームドーザ
   * @param pilotId 選択したパイロット
   * @return マッチング結果
   */
  enterPrivateMatchRoom(
    roomID: PrivateMatchRoomID,
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<Battle | null>;
}
