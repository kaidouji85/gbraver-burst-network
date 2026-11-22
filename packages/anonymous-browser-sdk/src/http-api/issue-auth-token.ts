import { SignalContainer } from "../abort-controller/signal-container";
import {
  IssueAuthTokenResponse,
  IssueAuthTokenResponseSchema,
} from "./response/issue-auth-token";

/**
 * 認証トークンを発行する
 * @param options 記録するログのオプション
 * @param options.apiURL WebRTCヘルパーREST APIのURL
 * @param options.signal アボートシグナル
 * @returns 発行した認証トークン
 */
export const issueAuthToken = async (
  options: Partial<SignalContainer> & {
    apiURL: string;
  },
): Promise<IssueAuthTokenResponse> => {
  const { apiURL, signal } = options;
  const response = await fetch(`${apiURL}/auth-token`, {
    method: "POST",
    signal,
  });
  if (response.status !== 201) {
    throw new Error(`Failed to issue auth token: ${response.status}`);
  }

  const body = await response.json();
  return IssueAuthTokenResponseSchema.parse(body);
};
