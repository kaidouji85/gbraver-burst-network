// @flow

import type {UniversalLogin, LoginCheck, Logout, Ping} from '@gbraver-burst-network/core';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {createAuth0ClientHelper} from '../auth0/client';
import {isLoginSuccessRedirect, clearLoginHistory} from '../auth0/login-redirect';
import {ping} from '../websocket/ping';

/** ブラウザSDK */
export interface BrowserSDK extends UniversalLogin, LoginCheck, Logout, Ping {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  _ownURL: string;
  _websocketAPIURL: string;
  _auth0Client: typeof Auth0Client;
  _websocket: ?WebSocket;

  /**
   * コンストラクタ
   *
   * @param ownURL リダイレクト元となるGブレイバーバーストのURL
   * @param websocketAPIURL Websocket API のURL
   * @param auth0Client auth0クライアント
   */
  constructor(ownURL: string, websocketAPIURL: string, auth0Client: typeof Auth0Client) {
    this._ownURL = ownURL;
    this._websocketAPIURL = websocketAPIURL;
    this._auth0Client = auth0Client;
    this._websocket = null;
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

  /** @override */
  async ping(): Promise<string> {
    const websocket = await this._getOrCreateWebSocket();
    return ping(websocket);
  }

  /**
   * WebSocketクライアントの取得を行う
   * WebSocketクライアントが存在しない場合は、本メソッド内で生成してから返す
   *
   * @return 取得、生成結果
   */
  async _getOrCreateWebSocket(): Promise<WebSocket> {
    if (this._websocket) {
      return this._websocket;
    }

    const accessToken = await this._auth0Client.getTokenSilently();
    this._websocket = new WebSocket(`${this._websocketAPIURL}?token=${accessToken}`);
    return this._websocket;
  }
}

/**
 * GブレイバーバーストブラウザSDKを生成する
 *
 * @param ownURL リダイレクト元となるGブレイバーバーストのURL
 * @param websocketAPIURL Websocket APIのURL
 * @param auth0Domain auth0ドメイン
 * @param auth0ClientID auth0クライアントID
 * @param auth0Audience auth0 audience
 * @return GブレイバーバーストブラウザSDK
 */
export async function createBrowserSDK(ownURL: string, websocketAPIURL: string, auth0Domain: string, auth0ClientID: string, auth0Audience: string): Promise<BrowserSDK> {
  const auth0Client = await createAuth0ClientHelper(auth0Domain, auth0ClientID, auth0Audience, ownURL);
  return new BrowserSDKImpl(ownURL, websocketAPIURL, auth0Client);
}