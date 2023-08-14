import { parsePing, Ping } from "../../../src/request/ping";

/** 有効なping */
const ping: Ping = {
  action: "ping",
};

test("pingはパースできる", () => {
  expect(parsePing(ping)).toEqual(ping);
});

test("余計なプロパティは削除してパースする", () => {
  expect(parsePing({ ...ping, hp: 1000 })).toEqual(ping);
});

test("nullはパースできない", () => {
  expect(parsePing(null)).toBe(null);
});

test("undefinedはパースできない", () => {
  expect(parsePing(undefined)).toBe(null);
});
