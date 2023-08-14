import {
  parsePrivateMatchMakePolling,
  PrivateMatchMakePolling,
} from "../../../src/request/private-match-make-polling";

/** 有効なプライベートルームマッチポーリング */
const privateMatchMakePolling: PrivateMatchMakePolling = {
  action: "private-match-make-polling",
  roomID: "roomID",
};

test("PrivateMatchMakePollingはパースできる", () => {
  expect(parsePrivateMatchMakePolling(privateMatchMakePolling)).toEqual(
    privateMatchMakePolling,
  );
});

test("余計なプロパティは削除される", () => {
  expect(
    parsePrivateMatchMakePolling({
      ...privateMatchMakePolling,
      propA: 12,
      propB: 12,
    }),
  ).toEqual(privateMatchMakePolling);
});

test("データ型が異なるとパースできない", () => {
  const data = {
    action: "private-match-make-polling",
    roomID: 1000,
  };
  expect(parsePrivateMatchMakePolling(data)).toBe(null);
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
