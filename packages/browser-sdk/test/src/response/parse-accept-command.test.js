// @flow

import {parseAcceptCommand} from "../../../src/response/accept-command";
import type {AcceptCommand} from "../../../src/response/accept-command";

const data: AcceptCommand = {action: 'accept-command'};

test('AcceptCommandなら正しくパースできる', () => {
  const result = parseAcceptCommand(data);
  expect(result).toEqual(data);
});

test('nullならパースできない', () => {
  const result = parseAcceptCommand(null);
  expect(result).toBe(null);
});

test('undefinedならパースできない', () => {
  const result = parseAcceptCommand(undefined);
  expect(result).toBe(null);
});
