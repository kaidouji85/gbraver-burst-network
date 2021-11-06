// @flow

import type {ArmDozerId, PilotId} from 'gbraver-burst-core';
import type {UniversalLogin, LoginCheck, Logout, Ping, CasualMatch, Battle, loggedInAccountDelete} from '@gbraver-burst-network/browser-core';
import {BattleSDK} from './battle-sdk';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {createAuth0ClientHelper} from '../auth0/client';
import {isLoginSuccessRedirect, clearLoginHistory} from '../auth0/login-redirect';
import {ping} from '../websocket/ping';
import {connect} from "../websocket/connect";
import {enterCasualMatch} from '../websocket/enter-casual-match';
import {deleteLoggedInAccount} from "../http-request/delete-logged-in-account";

/** ブラウザSDK */
export interface BrowserSDK extends UniversalLogin, LoginCheck, Logout, Ping, CasualMatch, loggedInAccountDelete {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  _ownURL: string;
  _restAPIURL: string;
  _websocketAPIURL: string;
  _auth0Client: typeof Auth0Client;
  _websocket: ?WebSocket;

  /**
   * コンストラクタ
   *
   * @param ownURL リダイレクト元となるGブレイバーバーストのURL
   * @param restAPIURL Rest API のURL
   * @param websocketAPIURL Websocket API のURL
   * @param auth0Client auth0クライアント
   */
  constructor(ownURL: string, restAPIURL: string, websocketAPIURL: string, auth0Client: typeof Auth0Client) {
    this._ownURL = ownURL;
    this._restAPIURL = restAPIURL;
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
  async logout(): Promise<void> {
    await this._auth0Client.logout({returnTo: this._ownURL});
  }

  /** @override */
  async deleteLoggedInAccount(): Promise<void> {
    await deleteLoggedInAccount(this._restAPIURL);
  }

  /** @override */
  async ping(): Promise<string> {
    const websocket = await this._getOrCreateWebSocket();
    const resp = await ping(websocket);
    return resp.message;
  }

  /** @override */
  async startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<Battle> {
    const websocket = await this._getOrCreateWebSocket();
    const resp = await enterCasualMatch(websocket, armdozerId, pilotId);
    return new BattleSDK({player: resp.player, enemy: resp.enemy, initialState: resp.stateHistory,
      battleID: resp.battleID, initialFlowID: resp.flowID, isPoller: resp.isPoller, websocket});
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
    this._websocket = await connect(`${this._websocketAPIURL}?token=${accessToken}`);
    return this._websocket;
  }
}

/**
 * GブレイバーバーストブラウザSDKを生成する
 *
 * @param ownURL リダイレクト元となるGブレイバーバーストのURL
 * @param restAPIURL Rest API のURL
 * @param websocketAPIURL Websocket APIのURL
 * @param auth0Domain auth0ドメイン
 * @param auth0ClientID auth0クライアントID
 * @param auth0Audience auth0 audience
 * @return GブレイバーバーストブラウザSDK
 */
export async function createBrowserSDK(ownURL: string, restAPIURL: string, websocketAPIURL: string, auth0Domain: string, auth0ClientID: string, auth0Audience: string): Promise<BrowserSDK> {
  const auth0Client = await createAuth0ClientHelper(auth0Domain, auth0ClientID, auth0Audience, ownURL);
  return new BrowserSDKImpl(ownURL, restAPIURL, websocketAPIURL, auth0Client);
}