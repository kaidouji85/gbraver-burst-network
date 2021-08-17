// @flow

import type {UniversalLogin, LoginCheck, Logout} from '@gbraver-burst-network/core';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {createAuth0ClientHelper} from '../auth0/client';
import {isLoginSuccessRedirect, clearLoginHistory} from '../auth0/login-success';

/** ブラウザSDK */
export interface BrowserSDK extends UniversalLogin, LoginCheck, Logout {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  _auth0Client: typeof Auth0Client;
  _ownURL: string;

  /**
   * コンストラクタ
   * 
   * @param auth0Client auth0クライアント
   * @param ownURL リダイレクト元となるGブレイバーバーストのURL
   */
  constructor(auth0Client: typeof Auth0Client, ownURL: string) {
    this._auth0Client = auth0Client;
    this._ownURL = ownURL;
  }

  /** @override */
  isLoginSuccessRedirect(): boolean {
    return isLoginSuccessRedirect();
  }

  /** @override */
  async afterLoginSuccess(): Promise<void> {
    await this._auth0Client.handleRedirectCallback();
    clearLoginHistory();
  }

  /** @override */
  async gotoLoginPage(): Promise<void> {
    await this._auth0Client.loginWithRedirect({redirect_uri: this._ownURL});
  }

  /** @override */
  isLogin(): Promise<boolean> {
    return this._auth0Client.isAuthenticated();
  }

  /** @override */
  logout(): Promise<void> {
    return this._auth0Client.logout();
  }
}

/**
 * GブレイバーバーストブラウザSDKを生成する
 * 
 * @param domain auth0ドメイン
 * @param clientID auth0クライアントID
 * @param audience auth0 audience
 * @param redirectURI リダイレクト元となるGブレイバーバーストのURL
 * @return GブレイバーバーストブラウザSDK
 */
export async function createBrowserSDK(domain: string, clientID: string, audience: string, ownURL: string): Promise<BrowserSDK> {
  const auth0Client = await createAuth0ClientHelper(domain, clientID, audience, ownURL);
  return new BrowserSDKImpl(auth0Client, ownURL);
}