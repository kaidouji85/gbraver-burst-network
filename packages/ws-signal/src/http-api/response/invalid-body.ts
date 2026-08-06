/** 不正なボディ */
export const INVALID_BODY_RESPONSE = {
  statusCode: 400,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ isSuccess: false, message: "Invalid Body" }),
};
