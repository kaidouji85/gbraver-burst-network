import { extractBearerToken } from "../../src/core/auth-token";

test("正しいフォーマットならトークンを抽出できる", () => {
  const token = extractBearerToken("Bearer abcdef123456");
  expect(token).toBe("abcdef123456");
});

test("小文字は不正フォーマットなのでトークンを抽出できない", () => {
  const token = extractBearerToken("bearer abcdef123456");
  expect(token).toBeNull();
});

test("Bearerだけは不正フォーマットなのでトークンを抽出できない", () => {
  const token = extractBearerToken("Bearer");
  expect(token).toBeNull();
});

test("トークン複数指定は不正フォーマットなのでトークンを抽出できない", () => {
  const token = extractBearerToken("Bearer abcdef123456 extra");
  expect(token).toBeNull();
});

test("空文字は不正フォーマットなのでトークンを抽出できない", () => {
  const token = extractBearerToken("");
  expect(token).toBeNull();
});
