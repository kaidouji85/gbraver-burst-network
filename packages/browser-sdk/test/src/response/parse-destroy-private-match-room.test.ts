import {
  DestroyPrivateMatchRoom,
  parseDestroyPrivateMatchRoom,
} from "../../../src/response/destroy-private-match-room";

test("DestroyPrivateMatchRoomはパースできる", () => {
  const data: DestroyPrivateMatchRoom = {
    action: "destroy-private-match-room",
    roomID: "test-room-id",
  };
  expect(parseDestroyPrivateMatchRoom(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: DestroyPrivateMatchRoom = {
    action: "destroy-private-match-room",
    roomID: "test-room-id",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseDestroyPrivateMatchRoom(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseDestroyPrivateMatchRoom(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseDestroyPrivateMatchRoom(data)).toBe(null);
});
