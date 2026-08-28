import {
  IssueAuthTokenResponse,
  IssueAuthTokenResponseSchema,
} from "./response/issue-auth-token";

/**
 * 認証トークンを発行する
 * @param apiURL WebRTCヘルパーREST APIのURL
 * @returns 発行した認証トークン
 */
export const issueAuthToken = async (
  apiURL: string,
): Promise<IssueAuthTokenResponse> => {
  const response = await fetch(`${apiURL}/auth-token`, {
    method: "POST",
  });
  if (response.status !== 201) {
    throw new Error(`Failed to issue auth token: ${response.status}`);
  }

  const body = await response.json();
  return IssueAuthTokenResponseSchema.parse(body);
};
