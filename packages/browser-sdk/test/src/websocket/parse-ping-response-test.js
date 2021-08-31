// @flow

import test from 'ava';
import type {PingResponse} from "../../../src/websocket/response";
import {parsePingResponse} from "../../../src/websocket/response";

const origin: PingResponse = {action: 'pong', message: 'test'};

test('PingResponseをパースすることができる', t => {
  const result = parsePingResponse(origin);
  t.deepEqual(result, origin);
});

test('余計なプロパティがあっても正しくパースはできる', t => {
  const result = parsePingResponse({...origin, hp: 1000, power: 2000});
  t.deepEqual(result, origin);
});

test('PingResponseのJSON文字列はパースできない', t => {
  const result = parsePingResponse(JSON.stringify(origin));
  t.is(result, null);
});

test('nullの場合はパースできない', t => {
  const result = parsePingResponse(null);
  t.is(result, null);
});

test('undefinedの場合はパースできない', t => {
  const result = parsePingResponse(undefined);
  t.is(result, null);
});