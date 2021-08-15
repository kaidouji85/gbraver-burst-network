// @flow

import test from 'ava';
import {EMPTY_ENTRY} from "../../../data/entry";
import {firstArrivalMatching} from "../../../../src/waiting-room/first-arrival-room/first-arrival-matching";

test('先頭2人がマッチングされる', t => {
  const entry1 = {...EMPTY_ENTRY, userID: 'test01'};
  const entry2 = {...EMPTY_ENTRY, userID: 'test02'};
  const entry3 = {...EMPTY_ENTRY, userID: 'test03'};
  const entry4 = {...EMPTY_ENTRY, userID: 'test04'};
  const roomEntries = [entry1, entry2, entry3, entry4];
  const result = firstArrivalMatching(roomEntries);
  const expected = {
    isSuccess: true,
    matching: [entry1, entry2],
    roomEntries: [entry3, entry4]
  };
  t.deepEqual(result, expected);
});

test('1人しかエントリーしていないと、マッチングが失敗する', t => {
  const entry1 = {...EMPTY_ENTRY, userID: 'test01'};
  const roomEntries = [entry1];
  const result = firstArrivalMatching(roomEntries);
  const expected = {
    isSuccess: false,
    roomEntries: [entry1]
  };
  t.deepEqual(result, expected);
});

test('エントリーが2人でも、マッチング成立する', t => {
  const entry1 = {...EMPTY_ENTRY, userID: 'test01'};
  const entry2 = {...EMPTY_ENTRY, userID: 'test02'};
  const roomEntries = [entry1, entry2];
  const result = firstArrivalMatching(roomEntries);
  const expected = {
    isSuccess: true,
    matching: [entry1, entry2],
    roomEntries: []
  };
  t.deepEqual(result, expected);
});

test('誰もエントリしていない場合、マッチング失敗', t => {
  const roomEntries = [];
  const result = firstArrivalMatching(roomEntries);
  const expected = {
    isSuccess: false,
    roomEntries: []
  };
  t.deepEqual(result, expected);
});