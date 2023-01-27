import { casualMatchMake } from "../../../src/core/casual-match-make";
import { EMPTY_CASUAL_MATCH_ENTRY } from "../../data/casual-match";

const entry1 = { ...EMPTY_CASUAL_MATCH_ENTRY, userID: "user01" };
const entry2 = { ...EMPTY_CASUAL_MATCH_ENTRY, userID: "user02" };
const entry3 = { ...EMPTY_CASUAL_MATCH_ENTRY, userID: "user03" };
const entry4 = { ...EMPTY_CASUAL_MATCH_ENTRY, userID: "user04" };
const entry5 = { ...EMPTY_CASUAL_MATCH_ENTRY, userID: "user05" };

test("先頭から順番にマッチメイクすることができる", () => {
  const entries = [entry1, entry2, entry3, entry4, entry5];
  const result = casualMatchMake(entries);
  const expected = [
    [entry1, entry2],
    [entry3, entry4],
  ];
  expect(result).toEqual(expected);
});

test("エントリが1個の場合はマッチングが成立しない", () => {
  const entries = [entry1];
  const result = casualMatchMake(entries);
  expect(result).toEqual([]);
});

test("エントリが0の場合はマッチングが成立しない", () => {
  const result = casualMatchMake([]);
  expect(result).toEqual([]);
});
