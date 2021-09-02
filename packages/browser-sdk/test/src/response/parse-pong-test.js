// @flow

import test from 'ava';
import type {Pong} from "../../../src/response/pong";
import {parsePong} from "../../../src/response/pong";

const origin: Pong = {action: 'pong', message: 'test'};

test('Pongをパースすることができる', t => {
  const result = parsePong(origin);
  t.deepEqual(result, origin);
});

test('余計なプロパティがあっても正しくパースはできる', t => {
  const result = parsePong({...origin, hp: 1000, power: 2000});
  t.deepEqual(result, origin);
});

test('PongのJSON文字列はパースできない', t => {
  const result = parsePong(JSON.stringify(origin));
  t.is(result, null);
});

test('nullの場合はパースできない', t => {
  const result = parsePong(null);
  t.is(result, null);
});

test('undefinedの場合はパースできない', t => {
  const result = parsePong(undefined);
  t.is(result, null);
});