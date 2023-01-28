import {
  EnteredPrivateMatchRoom,
  parseEnteredPrivateMatchRoom,
} from "../../../src/response/entered-private-match-room";

test("EnteredPrivateMatchRoomはパースできる", () => {
  const data: EnteredPrivateMatchRoom = {
    action: "entered-private-match-room",
  };
  expect(parseEnteredPrivateMatchRoom(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: EnteredPrivateMatchRoom = {
    action: "entered-private-match-room",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseEnteredPrivateMatchRoom(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseEnteredPrivateMatchRoom(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseEnteredPrivateMatchRoom(data)).toBe(null);
});
