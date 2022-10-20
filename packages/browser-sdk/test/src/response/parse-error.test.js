// @flow

import type { Error } from "../../../src/response/error";
import { parseError } from "../../../src/response/error";

test("Errorを正しくパースできる", () => {
  const data: Error = { action: "error", error: "error message" };
  const result = parseError(data);
  expect(result).toEqual(data);
});

test("errorが複雑なオブジェクトでもパースできる", () => {
  const data: Error = { action: "error", error: { test: 12 } };
  const result = parseError(data);
  expect(result).toEqual(data);
});

test("errorプロパティがないとパースできない", () => {
  const data = { action: "error" };
  const result = parseError(data);
  expect(result).toBe(null);
});

test("nullはパースできない", () => {
  const result = parseError(null);
  expect(result).toBe(null);
});

test("undefinedはパースできない", () => {
  const result = parseError(undefined);
  expect(result).toBe(null);
});
