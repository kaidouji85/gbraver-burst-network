// @flow

import test from 'ava';
import {EMPTY_ENTRY} from "../../data/entry";
import {isDoubleEntry} from "../../../src/waiting-room/is-double-entry";

test('同じユーザIDでエントリした場合、二重入室と判定する', t => {
  const roomEntries = [
    {...EMPTY_ENTRY, sessionID: 'test01'},
    {...EMPTY_ENTRY, sessionID: 'test02'},
  ];
  const entry = {...EMPTY_ENTRY, sessionID: 'test02'};
  const result = isDoubleEntry(roomEntries, entry);
  t.true(result);
});

test('ルームエントリに含まれていないユーザIDでエントリしたら、二重入室ではない', t => {
  const roomEntries = [
    {...EMPTY_ENTRY, sessionID: 'test01'},
    {...EMPTY_ENTRY, sessionID: 'test02'},
  ];
  const entry = {...EMPTY_ENTRY, sessionID: 'test03'};
  const result = isDoubleEntry(roomEntries, entry);
  t.false(result);
});

test('誰もエントリしてないルームにエントリーしたら、二重入室ではない', t => {
  const roomEntries = [];
  const entry = {...EMPTY_ENTRY, sessionID: 'test01'};
  const result = isDoubleEntry(roomEntries, entry);
  t.false(result);
});
