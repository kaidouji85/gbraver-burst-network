import {
  parsePrivateMatchMakePolling,
  PrivateMatchMakePolling,
} from "../../../src/request/private-match-make-polling";

test("PrivateMatchMakePollingはパースできる", () => {
  const data: PrivateMatchMakePolling = {
    action: "private-match-make-polling",
    roomID: "roomID",
  };
  expect(parsePrivateMatchMakePolling(data)).toEqual(data);
});

test("余計なプロパティは削除される", () => {
  const origin: PrivateMatchMakePolling = {
    action: "private-match-make-polling",
    roomID: "roomID",
  };
  const data = { ...origin, propA: 12, propB: 12 };
  expect(parsePrivateMatchMakePolling(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parsePrivateMatchMakePolling(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parsePrivateMatchMakePolling(data)).toBe(null);
});

test("空オブジェクトはパースできない", () => {
  const data = {};
  expect(parsePrivateMatchMakePolling(data)).toBe(null);
});
