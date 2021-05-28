// @flow
import type {Entry} from "../entry";

/** 先着順マッチングの結果 */
export type FirstArrivalMatchingResult = SuccessFirstArrivalMatching | FailFirstArrivalMatching;

/** 先着順マッチング成功 */
export type SuccessFirstArrivalMatching = {
  isSuccess: true,
  matching: [Entry, Entry],
  roomEntries: Entry[]
}
/** 先着順マッチング失敗 */
export type FailFirstArrivalMatching = {
  isSuccess: false,
  roomEntries: Entry[]
};

/**
 * 先着順でマッチングをする
 *
 * @param roomEntries 待合室の全エントリ
 * @param entry 新しいエントリ
 * @return マッチング結果
 */
export function firstArrivalMatching(roomEntries: Entry[], entry: Entry): FirstArrivalMatchingResult {
  if (roomEntries.length <= 0) {
    return {isSuccess: false, roomEntries: [...roomEntries, entry]};
  }

  const matching: [Entry, Entry] = [roomEntries[0], entry];
  const updatedRoomEntries = roomEntries.slice(1);
  return {isSuccess: true, matching: matching, roomEntries: updatedRoomEntries};
}