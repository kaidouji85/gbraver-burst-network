// @flow

import test from 'ava';
import {EMPTY_PLAYER} from 'gbraver-burst-core';
import { extractPlayerAndEnemy } from '../../../src/battle-room/extract-player-and-enemy';

const player1 = {
  sessionID: 'session1',
  player: {
    ...EMPTY_PLAYER,
    plaeyrId: 'player1'
  }
};

const player2 = {
  sessionID: 'session2',
  player: {
    ...EMPTY_PLAYER,
    plaeyrId: 'player2'
  }
};

const roomPlayers = [player1, player2];
  
test('プレイヤー、敵の抽出が正しくできる', t => {
  const result = extractPlayerAndEnemy(player2.sessionID, roomPlayers);
  const expected = {player: player2.player, enemy: player1.player};
  t.deepEqual(result, expected);
});

test('ルームに存在しないセッションIDを指定した場合は、例外が発生する', t => {
  t.throws(() => {
    extractPlayerAndEnemy('no-exist-session-id', roomPlayers);
  });
});