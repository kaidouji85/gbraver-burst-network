/** フロントエンドログ成功レスポンス */
export const LOGGING_SUCCESS_RESPONSE = {
  statusCode: 201,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ success: true }),
};
