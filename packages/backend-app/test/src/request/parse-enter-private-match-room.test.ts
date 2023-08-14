import {
  EnterPrivateMatchRoom,
  parseEnterPrivateMatchRoom,
} from "../../../src/request/enter-private-match-room";

/** 有効なプライベートマッチルームエントリ */
const enterPrivateMatchRoom: EnterPrivateMatchRoom = {
  action: "enter-private-match-room",
  roomID: "room-id",
  armdozerId: "armdozer-id",
  pilotId: "pilot-id",
};

test("EnterPrivateMatchRoomはパースできる", () => {
  expect(parseEnterPrivateMatchRoom(enterPrivateMatchRoom)).toEqual(
    enterPrivateMatchRoom,
  );
});

test("余計なプロパティは削除してからパースする", () => {
  expect(
    parseEnterPrivateMatchRoom({ ...enterPrivateMatchRoom, hp: 1000 }),
  ).toEqual(enterPrivateMatchRoom);
});

test("データ型が異なるとパースできない", () => {
  const data = {
    action: "enter-private-match-room",
    roomID: 100,
    armdozerId: 100,
    pilotId: 100,
  };
  expect(parseEnterPrivateMatchRoom(data)).toBe(null);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseEnterPrivateMatchRoom(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseEnterPrivateMatchRoom(data)).toBe(null);
});
