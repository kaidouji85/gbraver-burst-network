// @flow

import test from 'ava';
import type {SendCommand} from "../../../src/request/sned-command";
import {parseSendCommand} from "../../../src/request/sned-command";

const sendCommand: SendCommand = {
  action: 'send-command',
  battleID: 'xxxxx',
  flowID: 'xxxxx',
  command: {
    type: 'BATTERY_COMMAND',
    battery: 3
  }
};

test('SendCommandなら正しくパースできる', t => {
  const result = parseSendCommand(sendCommand);
  t.deepEqual(result, sendCommand);
});

test('nullはパースできない', t => {
  const result = parseSendCommand(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseSendCommand(undefined);
  t.is(result, null);
});