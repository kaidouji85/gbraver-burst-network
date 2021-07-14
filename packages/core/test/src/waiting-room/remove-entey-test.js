// @flow

import test from 'ava';
import {removeEntry} from '../../../src/waiting-room/remove-entry';
import {EMPTY_ENTRY} from "../../data/entry";

const entry1 = {...EMPTY_ENTRY, userID: 'session1'};
const entry2 = {...EMPTY_ENTRY, userID: 'session2'};
const entry3 = {...EMPTY_ENTRY, userID: 'session3'};
const roomEntries = [entry1, entry2, entry3];

test('指定したセッションIDを持つエントリを取り除くことができる', t => {
  const result = removeEntry(roomEntries, entry2.userID);
  const expected = [entry1, entry3];
  t.deepEqual(result, expected);
});

test('ルームに存在しないエントリを指定した場合、ルーム全体のエントリに変化はない', t => {
  const result = removeEntry(roomEntries, 'no-exist-session');
  const expected = roomEntries
  t.deepEqual(result, expected);
});