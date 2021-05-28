// @flow

import test from 'ava';
import {EMPTY_ENTRY} from "../../data/entry";
import {isDoubleEntry} from "../../../src/waiting-room/is-double-entry";

test('同じユーザIDでエントリした場合、二重入室と判定する', t => {
  const roomEntries = [
    {...EMPTY_ENTRY, userID: 'test01'},
    {...EMPTY_ENTRY, userID: 'test02'},
  ];
  const entry = {...EMPTY_ENTRY, userID: 'test02'};
  const result = isDoubleEntry(roomEntries, entry);
  t.true(result);
});