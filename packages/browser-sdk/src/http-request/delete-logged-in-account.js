// @flow

/**
 * 現在ログインしているアカウントを削除する
 *
 * @param restAPIURL Rest API のURL
 * @return 処理が完了したら発火するPromise
 */
export async function deleteLoggedInAccount(restAPIURL: string): Promise<void> {
  await fetch(`${restAPIURL}`, {
    mode: 'cors',
    method: 'DELETE'
  });
}