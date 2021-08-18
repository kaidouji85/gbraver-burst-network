// @flow

import createAuth0Client, {Auth0Client} from '@auth0/auth0-spa-js';

/**
 * Auth0Clientを生成するヘルパー関数
 * 
 * @param domain auth0ドメイン
 * @param clientID auth0クライアントID
 * @param audience auth0 audience
 * @param redirectURI リダイレクト元となるGブレイバーバーストのURL
 * @return Auth0Client
 */
export function createAuth0ClientHelper(domain: string, clientID: string, audience: string, redirectURI: string): Promise<typeof Auth0Client> {
  return createAuth0Client({
    domain: domain, 
    client_id: clientID, 
    responseType: 'token id_token', 
    audience: audience, 
    redirectUri: redirectURI
  });
}