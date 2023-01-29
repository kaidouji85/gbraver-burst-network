import {
  NotChosenAsPrivateMatchPartner,
  parseNotChosenAsPrivateMatchPartner,
} from "../../../src/response/not-chosen-as-private-match-partner";

test("NotChosenAsPrivateMatchPartnerはパースできる", () => {
  const data: NotChosenAsPrivateMatchPartner = {
    action: "not-chosen-as-private-match-partner",
  };
  expect(parseNotChosenAsPrivateMatchPartner(data)).toEqual(data);
});

test("余計なプロパティがあってもパースできる", () => {
  const origin: NotChosenAsPrivateMatchPartner = {
    action: "not-chosen-as-private-match-partner",
  };
  const data = {
    ...origin,
    propA: 1000,
    propB: "value",
  };
  expect(parseNotChosenAsPrivateMatchPartner(data)).toEqual(origin);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseNotChosenAsPrivateMatchPartner(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseNotChosenAsPrivateMatchPartner(data)).toBe(null);
});
