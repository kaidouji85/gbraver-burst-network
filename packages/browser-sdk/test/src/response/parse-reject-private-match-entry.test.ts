import {
  parseRejectPrivateMatchEntry,
  RejectPrivateMatchEntry,
} from "../../../src/response/reject-private-match-entry";

test("RejectPrivateMatchEntryはパースできる", () => {
  const data: RejectPrivateMatchEntry = {
    action: "reject-private-match-entry",
  };
  expect(parseRejectPrivateMatchEntry(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: RejectPrivateMatchEntry = {
    action: "reject-private-match-entry",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseRejectPrivateMatchEntry(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseRejectPrivateMatchEntry(data)).toEqual(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseRejectPrivateMatchEntry(data)).toEqual(null);
});
