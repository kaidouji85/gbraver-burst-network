import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { FrontendLogSchema } from "./core/frontend-log";
import { INVALID_BODY_RESPONSE } from "./http-api/response/invalid-body";
import { LOGGING_SUCCESS_RESPONSE } from "./http-api/response/success";
import { parseJSON } from "./json/parse";

/**
 * フロントエンド側のログを記録する
 * @param event API Gatewayのイベント
 * @returns レスポンス
 */
export const frontendLog = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const parsedBody = parseJSON(event.body);
  const frontendLog = FrontendLogSchema.safeParse(parsedBody);
  if (frontendLog.success === false) {
    return INVALID_BODY_RESPONSE;
  }

  console.log(JSON.stringify(frontendLog.data));
  return LOGGING_SUCCESS_RESPONSE;
};
