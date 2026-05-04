/** エラー */
export type Error = {
  action: "error";
  /* eslint-disable @typescript-eslint/no-explicit-any */
  error: any;
};

/** 不正なリクエストボディなのでエラー（定数） */
export const INVALID_REQUEST_BODY_ERROR: Error = {
  action: "error",
  error: "invalid request body",
};
