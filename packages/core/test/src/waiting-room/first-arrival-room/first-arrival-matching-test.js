// @flow

import test from 'ava';
import {EMPTY_ENTRY} from "../../../data/entry";
import {firstArrivalMatching} from "../../../../src/waiting-room/first-arrival-room/first-arrival-matching";

test('2人エントリしたらマッチングが成立する', t => {
  const entry1 = {...EMPTY_ENTRY, userID: 'test01'};
  const entry2 = {...EMPTY_ENTRY, userID: 'test02'};
  const roomEntries = [entry1];
  const result = firstArrivalMatching(roomEntries, entry2);
  const expected = {
    isSuccess: true,
    matching: [entry1, entry2],
    roomEntries: []
  };
  t.deepEqual(result, expected);
});

test('誰もいないルームにエントリしても、マッチングが成立しない', t => {
  const entry1 = {...EMPTY_ENTRY, userID: 'test01'};
  const roomEntries = [];
  const result = firstArrivalMatching(roomEntries, entry1);
  const expected = {
    isSuccess: false,
    roomEntries: [entry1]
  };
  t.deepEqual(result, expected);
});
