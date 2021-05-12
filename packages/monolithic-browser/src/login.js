// @flow

import type {UserID} from "@gbraver-burst-network/core/lib";

/**
 * ログイン処理を行う
 *
 * @param userID ユーザID
 * @param password パスワード
 * @param apiServerURL APIサーバのURL
 * @return ログイン結果
 */
export async function login(userID: UserID, password: string, apiServerURL: string): Promise<boolean> {
  const body = {
    userID: userID,
    password: password
  };
  const resp = await fetch(`${apiServerURL}/login`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return resp.status === 200;
}