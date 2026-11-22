import { SignalContainer } from "../abort-controller/signal-container";
import { FrontendLog } from "./request/frontend-log";

/**
 * フロントエンドのログを記録する
 * @param options 記録するログのオプション
 * @param options.authToken 認証トークン
 * @param options.body 記録するログの内容
 * @param options.apiURL WebRTCヘルパーREST APIのURL
 * @param options.signal アボートシグナル
 * @returns ログ記録結果、trueで成功
 */
export const frontendLog = async (
  options: Partial<SignalContainer> & {
    apiURL: string;
    authToken: string;
    body: FrontendLog;
  },
): Promise<boolean> => {
  const { apiURL, authToken, body, signal } = options;
  const response = await fetch(`${apiURL}/frontend-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  return response.status === 201;
};
