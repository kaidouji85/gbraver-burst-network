// @flow

import test from 'ava';
import type {Error} from '../../../src/response/error';
import {parseError} from "../../../src/response/error";

test('Errorを正しくパースできる', t => {
  const data: Error = {action: 'error', error: 'error message'};
  const result = parseError(data);
  t.deepEqual(result, data);
});

test('errorが複雑なオブジェクトでもパースできる', t => {
  const data: Error = {action: 'error', error: {test: 12}}
  const result = parseError(data);
  t.deepEqual(result, data);
});

test('errorプロパティがないとパースできない', t => {
  const data = {action: 'error'}
  const result = parseError(data);
  t.is(result, null);
});

test('nullはパースできない', t => {
  const result = parseError(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseError(undefined);
  t.is(result, null);
});