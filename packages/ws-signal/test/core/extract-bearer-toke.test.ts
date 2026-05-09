import { extractBearerToken } from "../../src/core/auth-token";

test("正しいフォーマットならトークンを抽出できる", () => {
  const token = extractBearerToken("Bearer abcdef123456");
  expect(token).toBe("abcdef123456");
});
