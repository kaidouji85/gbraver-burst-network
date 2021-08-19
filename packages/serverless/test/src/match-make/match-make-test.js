// @flow

import test from 'ava';
import {EMPTY_CASUAL_MATCH_ENTRY} from "../../data/casual-match";
import {matchMake} from "../../../src/match-make/match-make";

const entry1 = {...EMPTY_CASUAL_MATCH_ENTRY, userID: 'user01'};
const entry2 = {...EMPTY_CASUAL_MATCH_ENTRY, userID: 'user02'};
const entry3 = {...EMPTY_CASUAL_MATCH_ENTRY, userID: 'user03'};
const entry4 = {...EMPTY_CASUAL_MATCH_ENTRY, userID: 'user04'};
const entry5 = {...EMPTY_CASUAL_MATCH_ENTRY, userID: 'user05'};

test('先頭から順番にマッチメイクすることができる', t => {
  const entries = [entry1, entry2, entry3, entry4, entry5];
  const result = matchMake(entries);
  const expected = {
    matchingList: [
      [entry1, entry2],
      [entry3, entry4],
    ],
    remainder: [entry5]
  };
  t.deepEqual(result, expected);
});

test('エントリが1個の場合は何も変わらない', t => {
  const entries = [entry1];
  const result = matchMake(entries);
  const expected = {
    matchingList: [],
    remainder: [entry1]
  };
  t.deepEqual(result, expected);
});

test('エントリが0の場合でも正しく動く', t => {
  const entries = [];
  const result = matchMake(entries);
  const expected = {
    matchingList: [],
    remainder: []
  };
  t.deepEqual(result, expected);
});