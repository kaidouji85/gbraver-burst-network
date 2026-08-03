/** 不正なボディ */
export const INVALID_BODY_RESPONSE = {
  statusCode: 400,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ success: false, message: "Invalid Body" }),
};
