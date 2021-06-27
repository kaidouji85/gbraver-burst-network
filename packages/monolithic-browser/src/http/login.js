// @flow

import type {UserID} from "@gbraver-burst-network/core/lib";

/** ログインAPI実行結果 */
export type LoginResult = LoginSuccess | LoginFailed;

/** ログイン成功 */
export type LoginSuccess = {
  isSuccess: true,
  accessToken: string
};

/** ログイン失敗 */
export type LoginFailed = {
  isSuccess: false
};

/**
 * ログイン処理を行う
 * ログイン成功時にアクセストークンを発行する
 *
 * @param userID ユーザID
 * @param password パスワード
 * @param apiServerURL APIサーバのURL
 * @return 処理結果
 */
export async function login(userID: UserID, password: string, apiServerURL: string): Promise<LoginResult> {
  const body = {userID, password};
  const resp = await fetch(`${apiServerURL}/login`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (resp.status !== 200 ) {
    return {isSuccess: false};
  }
  const json = await resp.json();
  const accessToken = String(json?.accessToken);
  return {isSuccess: true, accessToken: accessToken};
}

/**
 * ログインチェックを行う
 * 引数に指定したアクセストークンが有効ならログインしていると見なす
 *
 * @param accessToken アクセストークン
 * @param apiServerURL APIサーバのURL
 * @return 判定結果、trueでログインしている
 */
export async function isLogin(accessToken: string, apiServerURL: string): Promise<boolean> {
  const resp = await fetch(`${apiServerURL}/login`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
  });
  return resp.status === 200;
}