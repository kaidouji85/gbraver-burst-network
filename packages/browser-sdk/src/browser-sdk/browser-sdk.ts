import { Auth0Client } from "@auth0/auth0-spa-js";
import type {
  Battle,
  CasualMatch,
  LoggedInUserDelete,
  LoginCheck,
  Logout,
  MailVerify,
  Ping,
  UniversalLogin,
  UserMailGet,
  UserNameGet,
  UserPictureGet,
  WebsocketDisconnect,
  WebsocketErrorNotifier,
  WebsocketUnintentionalCloseNotifier,
} from "@gbraver-burst-network/browser-core";
import {
  PrivateMatchCreate,
  PrivateMatchRoom,
} from "@gbraver-burst-network/browser-core/src";
import type { ArmDozerId, PilotId } from "gbraver-burst-core";
import { fromEvent, Observable, Subject, Subscription } from "rxjs";

import { createAuth0ClientHelper } from "../auth0/client";
import {
  clearLoginHistory,
  isLoginSuccessRedirect,
} from "../auth0/login-redirect";
import { deleteLoggedInUser } from "../http-request/delete-user";
import { connect } from "../websocket/connect";
import { createPrivateMatchRoom } from "../websocket/create-private-match-room";
import { enterCasualMatch } from "../websocket/enter-casual-match";
import { ping } from "../websocket/ping";
import { BattleSDK } from "./battle-sdk";
import { PrivateMatchRoomSDK } from "./private-match-room-sdk";

/** ブラウザSDK */
export interface BrowserSDK
  extends UniversalLogin,
    LoginCheck,
    Logout,
    Ping,
    CasualMatch,
    UserNameGet,
    UserPictureGet,
    UserMailGet,
    MailVerify,
    LoggedInUserDelete,
    WebsocketDisconnect,
    WebsocketErrorNotifier,
    WebsocketUnintentionalCloseNotifier,
    PrivateMatchCreate {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  _ownURL: string;
  _restAPIURL: string;
  _websocketAPIURL: string;
  _auth0Client: Auth0Client;
  _websocket: WebSocket | null;
  _websocketError: Subject<unknown>;
  _websocketUnintentionalCloseNotifier: Subject<unknown>;
  _websocketSubscriptions: Subscription[];

  /**
   * コンストラクタ
   *
   * @param ownURL リダイレクト元となるGブレイバーバーストのURL
   * @param restAPIURL Rest API のURL
   * @param websocketAPIURL Websocket API のURL
   * @param auth0Client auth0クライアント
   */
  constructor(
    ownURL: string,
    restAPIURL: string,
    websocketAPIURL: string,
    auth0Client: Auth0Client
  ) {
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
    await this._auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this._ownURL,
      },
    });
  }

  /** @override */
  isLogin(): Promise<boolean> {
    return this._auth0Client.isAuthenticated();
  }

  /** @override */
  async logout(): Promise<void> {
    await this._auth0Client.logout({
      logoutParams: {
        returnTo: this._ownURL,
      },
    });
  }

  /** @override */
  async getUserName(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.nickname ?? "";
  }

  /** @override */
  async getUserPictureURL(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.picture ?? "";
  }

  /** @override */
  async getMail(): Promise<string> {
    const user = await this._auth0Client.getUser();
    return user?.email ?? "";
  }

  /** @override */
  async isMailVerified(): Promise<boolean> {
    const user = await this._auth0Client.getUser();
    return user?.email_verified ?? false;
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
  async startCasualMatch(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<Battle> {
    const websocket = await this._getOrCreateWebSocket();
    const resp = await enterCasualMatch(websocket, armdozerId, pilotId);
    return new BattleSDK({
      player: resp.player,
      enemy: resp.enemy,
      initialState: resp.stateHistory,
      battleID: resp.battleID,
      initialFlowID: resp.flowID,
      isPoller: resp.isPoller,
      websocket,
    });
  }

  /** @override */
  async createPrivateMatchRoom(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<PrivateMatchRoom> {
    const websocket = await this._getOrCreateWebSocket();
    const resp = await createPrivateMatchRoom(websocket, armdozerId, pilotId);
    return new PrivateMatchRoomSDK(resp.roomID);
  }

  /** @override */
  async disconnectWebsocket(): Promise<void> {
    this._websocket && this._websocket.close();
    this._websocket = null;

    this._websocketSubscriptions.forEach((v) => {
      v.unsubscribe();
    });

    this._websocketSubscriptions = [];
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this._websocketError;
  }

  /** @override */
  websocketUnintentionalCloseNotifier(): Observable<unknown> {
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
    const websocket = await connect(
      `${this._websocketAPIURL}?token=${accessToken}`
    );
    this._websocketSubscriptions = [
      fromEvent(websocket, "error").subscribe(this._websocketError),
      fromEvent(websocket, "close").subscribe(this._websocketError),
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
export async function createBrowserSDK(
  ownURL: string,
  restAPIURL: string,
  websocketAPIURL: string,
  auth0Domain: string,
  auth0ClientID: string,
  auth0Audience: string
): Promise<BrowserSDK> {
  const auth0Client = await createAuth0ClientHelper(
    auth0Domain,
    auth0ClientID,
    auth0Audience,
    ownURL
  );
  return new BrowserSDKImpl(ownURL, restAPIURL, websocketAPIURL, auth0Client);
}
