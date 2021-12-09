// @flow

import type {ArmDozerId, PilotId} from 'gbraver-burst-core';
import type {
  Battle,
  CasualMatch,
  LoggedInUserDelete,
  LoginCheck,
  Logout,
  Ping,
  UniversalLogin,
  UserNameGet,
  UserPictureGet,
  UserMailGet,
  MailVerify,
  WebsocketDisconnect,
  WebsocketErrorNotifier,
  WebsocketUnintentionalCloseNotifier
} from '@gbraver-burst-network/browser-core';
import {Observable, Subject, fromEvent, Subscription} from 'rxjs';
import {BattleSDK} from './battle-sdk';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {createAuth0ClientHelper} from '../auth0/client';
import {clearLoginHistory, isLoginSuccessRedirect} from '../auth0/login-redirect';
import {ping} from '../websocket/ping';
import {connect} from "../websocket/connect";
import {enterCasualMatch} from '../websocket/enter-casual-match';
import {deleteLoggedInUser} from "../http-request/delete-user";

/** ブラウザSDK */
export interface BrowserSDK extends UniversalLogin, LoginCheck, Logout, Ping, CasualMatch,
  UserNameGet, UserPictureGet, UserMailGet, MailVerify, LoggedInUserDelete, WebsocketDisconnect,
  WebsocketErrorNotifier, WebsocketUnintentionalCloseNotifier {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  _ownURL: string;
  _restAPIURL: string;
  _websocketAPIURL: string;
  _auth0Client: typeof Auth0Client;
  _websocket: ?WebSocket;
  _websocketError: typeof Subject;
  _websocketUnintentionalCloseNotifier: typeof Subject;
  _websocketSubscriptions: typeof Subscription[];

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
    this._websocketError = new Subject();
    this._websocketUnintentionalCloseNotifier = new Subject();
    this._websocketSubscriptions = [];
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
  async getUserName(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.nickname ?? '';
  }

  /** @override */
  async getUserPictureURL(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.picture ?? '';
  }
  /** @override */
  async getMail(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.email ?? '';
  }

  /** @override */
  async isMailVerified(): Promise<boolean> {
    const user = await this._auth0Client.getUser();
    return user?.email_verified;
  }

  /** @override */
  async deleteLoggedInUser(): Promise<void> {
    const accessToken = await this._auth0Client.getTokenSilently();
    await deleteLoggedInUser(this._restAPIURL, accessToken);
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

  /** @override */
  async disconnectWebsocket(): Promise<void> {
    if (!this._websocket) {
      return;
    }

    const websocket: WebSocket = this._websocket;
    this._websocketSubscriptions.forEach(v => {
      v.unsubscribe();
    });
    websocket.close();
    this._websocket = null;
  }

  /** @override */
  websocketErrorNotifier(): typeof Observable {
    return this._websocketError;
  }

  /** @override */
  websocketUnintentionalCloseNotifier(): typeof Observable {
    return this._websocketUnintentionalCloseNotifier;
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
    const websocket = await connect(`${this._websocketAPIURL}?token=${accessToken}`);
    this._websocketSubscriptions = [
      fromEvent(websocket, 'error').subscribe(this._websocketError),
      fromEvent(websocket, 'close').subscribe(this._websocketError)  ,
    ];
    this._websocket = websocket;
    return websocket;
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