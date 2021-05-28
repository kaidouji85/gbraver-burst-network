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
 * @return マッチング結果
 */
export function firstArrivalMatching(roomEntries: Entry[]): FirstArrivalMatchingResult {
  if (roomEntries.length < 2) {
    return {isSuccess: false, roomEntries: roomEntries};
  }

  const matching: [Entry, Entry] = [roomEntries[0], roomEntries[1]];
  const updatedRoomEntries = roomEntries.slice(2);
  return {isSuccess: true, matching: matching, roomEntries: updatedRoomEntries};
}