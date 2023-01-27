import {
  CreatedPrivateMatchRoom,
  parseCreatedPrivateMatchRoom,
} from "../../../src/response/created-private-match-room";

test("CreatedPrivateMatchRoomはパースできる", () => {
  const data: CreatedPrivateMatchRoom = {
    action: "created-private-match-room",
    roomID: "test-room-id",
  };
  expect(parseCreatedPrivateMatchRoom(data)).toEqual(data);
});

test("データ型が異なるとパースできない", () => {
  const data = {
    action: "created-private-match-room",
    roomID: 1000,
  };
  expect(parseCreatedPrivateMatchRoom(data)).toEqual(null);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseCreatedPrivateMatchRoom(data)).toEqual(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseCreatedPrivateMatchRoom(data)).toEqual(null);
});
