import { FrontendLog } from "./request/frontend-log";

/**
 * フロントエンドのログを記録する
 * @param options 記録するログのオプション
 * @param options.authToken 認証トークン
 * @param options.body 記録するログの内容
 * @param options.apiURL WebRTCヘルパーREST APIのURL
 * @returns ログ記録結果、trueで成功
 */
export const frontendLog = async (options: {
  apiURL: string;
  authToken: string;
  body: FrontendLog;
}): Promise<boolean> => {
  const { apiURL, authToken, body } = options;
  const response = await fetch(`${apiURL}/frontend-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  return response.status === 201;
};
