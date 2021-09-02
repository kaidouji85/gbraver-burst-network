// @flow

import test from 'ava';
import {parseAcceptCommand} from "../../../src/response/accept-command";
import type {AcceptCommand} from "../../../src/response/accept-command";

const data: AcceptCommand = {action: 'accept-command'};

test('AcceptCommandなら正しくパースできる', t => {
  const result = parseAcceptCommand(data);
  t.deepEqual(result, data);
});

test('nullならパースできない', t => {
  const result = parseAcceptCommand(null);
  t.is(result, null);
});

test('undefinedならパースできない', t => {
  const result = parseAcceptCommand(undefined);
  t.is(result, null);
});
