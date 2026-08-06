import { FrontendLog } from "./request/frontend-log";

/**
 * フロントエンドのログを記録する
 * @param apiURL WebRTCヘルパーREST APIのURL
 * @returns ログ記録結果、trueで成功
 */
export const frontendLog = async (
  apiURL: string,
  body: FrontendLog,
): Promise<boolean> => {
  const response = await fetch(`${apiURL}/frontend-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.status === 200;
};
