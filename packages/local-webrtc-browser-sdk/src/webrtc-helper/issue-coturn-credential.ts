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
  if (response.status !== 201) {
    throw new Error(`Failed to issue coturn credential: ${response.status}`);
  }

  const body = await response.json();
  return IssueCoturnCredentialResponseSchema.parse(body);
};
