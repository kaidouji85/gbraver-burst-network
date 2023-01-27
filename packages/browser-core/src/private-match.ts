import { ArmDozerId, PilotId } from "gbraver-burst-core";

/** プライベートマッチルームID */
export type PrivateMatchRoomID = string;

/** プライベートマッチルーム生成 */
export interface PrivateMatchCreator {
  /**
   * プライベートマッチルームを生成する
   * @param armdozerId 選択したアームドーザのID
   * @param pilotId 選択したパイロットのID
   * @return 生成したプライベートマッチルームのID
   */
  createPrivateMatchRoom(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<PrivateMatchRoomID>;
}
