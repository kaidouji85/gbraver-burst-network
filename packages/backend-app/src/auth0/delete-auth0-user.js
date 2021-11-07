// @flow

import {ManagementClient} from 'auth0';

/**
 * 指定したユーザをauth0から削除する
 *
 * @param domain auth0ドメイン
 * @param clientID Auth0 Management API に接続したApplicationのclient id
 * @param clientSecret Auth0 Management API に接続したApplicationのclient secret
 * @param userID 削除するユーザID
 * @return 処理が完了したら発火するPromise
 */
export async function deleteAuth0User(domain: string, clientID: string, clientSecret: string, userID: string): Promise<void> {
  const management = new ManagementClient({
    domain: domain,
    clientId: clientID,
    clientSecret: clientSecret,
    scope: 'delete:users'
  });
  await management.deleteUser({id: userID});
}