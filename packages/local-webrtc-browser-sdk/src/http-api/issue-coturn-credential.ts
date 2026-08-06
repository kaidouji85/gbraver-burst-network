import {
  IssueCoturnCredentialResponse,
  IssueCoturnCredentialResponseSchema,
} from "./response/issue-coturn-credential";

/**
 * coturnクレデンシャルを発行する
 * @param options オプション
 * @param options.apiURL WebRTCヘルパーREST APIのURL
 * @param options.authToken 認証トークン
 * @returns 発行したクレデンシャル
 */
export const issueCoturnCredential = async (options: {
  apiURL: string;
  authToken: string;
}): Promise<IssueCoturnCredentialResponse> => {
  const { apiURL, authToken } = options;
  const response = await fetch(`${apiURL}/coturn/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status !== 201) {
    throw new Error(`Failed to issue coturn credential: ${response.status}`);
  }

  const body = await response.json();
  return IssueCoturnCredentialResponseSchema.parse(body);
};
