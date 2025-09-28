import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { MatchMaking } from "../../src/core/connection-state";
import { matchMake } from "../../src/core/match-make";

/**
 * テスト用のMatchMakingエントリーを作成するヘルパー関数
 * @param socketId ソケットID
 * @param armdozerId アームドーザID（デフォルト: SHIN_BRAVER）
 * @param pilotId パイロットID（デフォルト: SHINYA）
 * @returns MatchMaking型のテストデータ
 */
const createMatchMakingEntry = (
  socketId: string,
  armdozerId: string = ArmdozerIds.SHIN_BRAVER,
  pilotId: string = PilotIds.SHINYA,
): MatchMaking => ({
  type: "MatchMaking",
  socketId,
  armdozerId,
  pilotId,
});

test("エントリが空の場合は、空配列を返す", () => {
  expect(matchMake([])).toEqual([]);
});

test("エントリが1つの場合は、空配列を返す（ペアが作れない）", () => {
  const entries = [createMatchMakingEntry("socket1")];
  expect(matchMake(entries)).toEqual([]);
});

test("エントリが2つの場合は、1つのペアを返す", () => {
  const entry1 = createMatchMakingEntry(
    "socket1",
    ArmdozerIds.SHIN_BRAVER,
    PilotIds.SHINYA,
  );
  const entry2 = createMatchMakingEntry(
    "socket2",
    ArmdozerIds.NEO_LANDOZER,
    PilotIds.GAI,
  );
  const entries = [entry1, entry2];
  const result = matchMake(entries);
  expect(result).toEqual([[entry1, entry2]]);
});

test("エントリが3つの場合は、1つのペアを返す（1つが余る）", () => {
  const entry1 = createMatchMakingEntry(
    "socket1",
    ArmdozerIds.SHIN_BRAVER,
    PilotIds.SHINYA,
  );
  const entry2 = createMatchMakingEntry(
    "socket2",
    ArmdozerIds.NEO_LANDOZER,
    PilotIds.GAI,
  );
  const entry3 = createMatchMakingEntry(
    "socket3",
    ArmdozerIds.LIGHTNING_DOZER,
    PilotIds.RAITO,
  );
  const entries = [entry1, entry2, entry3];
  const result = matchMake(entries);
  expect(result).toEqual([[entry1, entry2]]);
});

test("エントリが4つの場合は、2つのペアを返す", () => {
  const entry1 = createMatchMakingEntry(
    "socket1",
    ArmdozerIds.SHIN_BRAVER,
    PilotIds.SHINYA,
  );
  const entry2 = createMatchMakingEntry(
    "socket2",
    ArmdozerIds.NEO_LANDOZER,
    PilotIds.GAI,
  );
  const entry3 = createMatchMakingEntry(
    "socket3",
    ArmdozerIds.LIGHTNING_DOZER,
    PilotIds.RAITO,
  );
  const entry4 = createMatchMakingEntry(
    "socket4",
    ArmdozerIds.WING_DOZER,
    PilotIds.TSUBASA,
  );
  const entries = [entry1, entry2, entry3, entry4];
  const result = matchMake(entries);
  expect(result).toEqual([
    [entry1, entry2],
    [entry3, entry4],
  ]);
});

test("エントリが5つの場合は、2つのペアを返す（1つが余る）", () => {
  const entry1 = createMatchMakingEntry(
    "socket1",
    ArmdozerIds.SHIN_BRAVER,
    PilotIds.SHINYA,
  );
  const entry2 = createMatchMakingEntry(
    "socket2",
    ArmdozerIds.NEO_LANDOZER,
    PilotIds.GAI,
  );
  const entry3 = createMatchMakingEntry(
    "socket3",
    ArmdozerIds.LIGHTNING_DOZER,
    PilotIds.RAITO,
  );
  const entry4 = createMatchMakingEntry(
    "socket4",
    ArmdozerIds.WING_DOZER,
    PilotIds.TSUBASA,
  );
  const entry5 = createMatchMakingEntry(
    "socket5",
    ArmdozerIds.GENESIS_BRAVER,
    PilotIds.YUUYA,
  );
  const entries = [entry1, entry2, entry3, entry4, entry5];
  const result = matchMake(entries);
  expect(result).toEqual([
    [entry1, entry2],
    [entry3, entry4],
  ]);
});
