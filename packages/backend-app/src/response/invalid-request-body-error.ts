import { Error } from "./websocket-response";

/** 不正なリクエストボディなのでエラー */
export const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};
