// @flow

import test from 'ava';
import type {PingResponse} from "../../../src/websocket/response";
import {parsePingResponse} from "../../../src/websocket/response";

const origin: PingResponse = {action: 'ping', message: 'test'};

test('PingResponseのJSON文字列を正しくパースできる', t => {
  const data = JSON.stringify(origin);
  const result = parsePingResponse(data);
  t.deepEqual(result, origin);
});

test('ただの文字列だとパースできない', t => {
  const data = 'hello test';
  const result = parsePingResponse(data);
  t.is(result, null);
});

test('余計なプロパティがあっても正しくパースはできる', t => {
  const data = JSON.stringify({...origin, hp: 1000, power: 2000})
  const result = parsePingResponse(data);
  t.deepEqual(result, origin);
});

test('空文字の場合はパースできない', t => {
  const data = '';
  const result = parsePingResponse(data);
  t.is(result, null);
});