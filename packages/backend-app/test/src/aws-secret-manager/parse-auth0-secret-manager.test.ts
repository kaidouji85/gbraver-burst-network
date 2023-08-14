import {
  Auth0Secret,
  parseAuth0Secret,
} from "../../../src/aws-secret-manager/auth0-secret";

/** 正常なAuth0Secret */
const validAuth0Secret: Auth0Secret = {
  auth0UserManagementAppClientSecret: "hogehoge",
};

test("Auth0Secretを正しくパースできる", () => {
  expect(parseAuth0Secret(validAuth0Secret)).toEqual(validAuth0Secret);
});

test("余計なプロパティがある場合は削除してパースする", () => {
  const data = { ...validAuth0Secret, hp: 1000 };
  expect(parseAuth0Secret(data)).toEqual(validAuth0Secret);
});

test("Auth0Secretでないオブジェクトはパースできない", () => {
  const data = { hp: 100 };
  expect(parseAuth0Secret(data)).toBe(null);
});

test("nullはパースできない", () => {
  expect(parseAuth0Secret(null)).toBe(null);
});

test("undefinedはパースできない", () => {
  expect(parseAuth0Secret(undefined)).toBe(null);
});
