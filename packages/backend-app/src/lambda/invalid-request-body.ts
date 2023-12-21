import { WebsocketAPIResponse } from "./websocket-api-response";

/** 不正なリクエストボディでエラー */
export const invalidRequestBody: WebsocketAPIResponse = {
  statusCode: 400,
  body: "invalid request body",
};