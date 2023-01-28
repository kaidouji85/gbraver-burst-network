import {
  NotFoundPrivateMatchRoom,
  parseNotFoundPrivateMatchRoom,
} from "../../../src/response/not-found-private-match-room";

test("NotFoundPrivateMatchRoomはパースできる", () => {
  const data: NotFoundPrivateMatchRoom = {
    action: "not-found-private-match-room",
  };
  expect(parseNotFoundPrivateMatchRoom(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: NotFoundPrivateMatchRoom = {
    action: "not-found-private-match-room",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseNotFoundPrivateMatchRoom(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseNotFoundPrivateMatchRoom(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseNotFoundPrivateMatchRoom(data)).toBe(null);
});
