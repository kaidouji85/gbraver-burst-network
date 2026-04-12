import { parseJSON } from "../json/parse";
import {
  IssueCoturnCredentialResponse,
  IssueCoturnCredentialResponseSchema,
} from "./response/issue-coturn-credential";

/**
 * coturnクレデンシャルを発行する
 * @param apiURL WebRTCヘルパーREST APIのURL
 * @returns 発行したクレデンシャル
 */
export const issueCoturnCredential = async (
  apiURL: string,
): Promise<IssueCoturnCredentialResponse> => {
  const response = await fetch(`${apiURL}/coturn/credentials`, {
    method: "POST",
  });
  const body = parseJSON(response.body);
  return IssueCoturnCredentialResponseSchema.parse(body);
};
