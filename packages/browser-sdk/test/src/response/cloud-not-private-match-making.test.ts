import {
  CouldNotPrivateMatchMaking,
  parseCouldNotPrivateMatchMaking,
} from "../../../src/response/cloud-not-private-match-making";

test("CouldNotPrivateMatchMakingはパースできる", () => {
  const data: CouldNotPrivateMatchMaking = {
    action: "cloud-not-private-match-making",
  };
  expect(parseCouldNotPrivateMatchMaking(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: CouldNotPrivateMatchMaking = {
    action: "cloud-not-private-match-making",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseCouldNotPrivateMatchMaking(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseCouldNotPrivateMatchMaking(data)).toEqual(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseCouldNotPrivateMatchMaking(data)).toEqual(null);
});
