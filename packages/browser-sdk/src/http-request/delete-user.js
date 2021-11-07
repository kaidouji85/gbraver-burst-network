// @flow

/**
 * 現在ログインしているユーザを削除する
 *
 * @param restAPIURL Rest API のURL
 * @param accessToken Auth0 アクセストークン
 * @return 処理が完了したら発火するPromise
 */
export async function deleteLoggedInUser(restAPIURL: string, accessToken: string): Promise<void> {
  await fetch(`${restAPIURL}`, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    method: 'DELETE'
  });
}