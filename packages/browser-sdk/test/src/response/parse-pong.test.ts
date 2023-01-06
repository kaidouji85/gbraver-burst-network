import type { Pong } from "../../../src/response/pong";
import { parsePong } from "../../../src/response/pong";

const origin: Pong = {
  action: "pong",
  message: "test"
};

test("Pongをパースすることができる", () => {
  const result = parsePong(origin);
  expect(result).toEqual(origin);
});

test("余計なプロパティがあっても正しくパースはできる", () => {
  const result = parsePong({ ...origin,
    hp: 1000,
    power: 2000
  });
  expect(result).toEqual(origin);
});

test("PongのJSON文字列はパースできない", () => {
  const result = parsePong(JSON.stringify(origin));
  expect(result).toBe(null);
});

test("nullの場合はパースできない", () => {
  const result = parsePong(null);
  expect(result).toBe(null);
});

test("undefinedの場合はパースできない", () => {
  const result = parsePong(undefined);
  expect(result).toBe(null);
});