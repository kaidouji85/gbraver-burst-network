import { Auth0Client } from "@auth0/auth0-spa-js";
import type {
  Battle,
  CasualMatch,
  LoggedInUserDelete,
  LoginCheck,
  Logout,
  MailVerify,
  Ping,
  PrivateMatchCreate,
  PrivateMatchRoom,
  PrivateMatchRoomEnter,
  PrivateMatchRoomID,
  UniversalLogin,
  UserMailGet,
  UserNameGet,
  UserPictureGet,
  WebsocketDisconnect,
  WebsocketErrorNotifier,
} from "@gbraver-burst-network/browser-core";
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
import { enterPrivateMatchRoom } from "../websocket/enter-private-match-room";
import { ping } from "../websocket/ping";
import { createBattleSDKFromBattleStart } from "./create-battle-sdk-from-battle-start";
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
    PrivateMatchCreate,
    PrivateMatchRoomEnter {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  #ownURL: string;
  #restAPIURL: string;
  #websocketAPIURL: string;
  #auth0Client: Auth0Client;
  #websocket: WebSocket | null;
  #websocketError: Subject<unknown>;
  #websocketSubscriptions: Subscription[];

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
    this.#ownURL = ownURL;
    this.#restAPIURL = restAPIURL;
    this.#websocketAPIURL = websocketAPIURL;
    this.#auth0Client = auth0Client;
    this.#websocket = null;
    this.#websocketError = new Subject();
    this.#websocketSubscriptions = [];
  }

  /** @override */
  isLoginSuccessRedirect(): boolean {
    return isLoginSuccessRedirect();
  }

  /** @override */
  async afterLoginSuccess(): Promise<void> {
    await this.#auth0Client.handleRedirectCallback();
    clearLoginHistory();
  }

  /** @override */
  async gotoLoginPage(): Promise<void> {
    await this.#auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this.#ownURL,
      },
    });
  }

  /** @override */
  isLogin(): Promise<boolean> {
    return this.#auth0Client.isAuthenticated();
  }

  /** @override */
  async logout(): Promise<void> {
    await this.#auth0Client.logout({
      logoutParams: {
        returnTo: this.#ownURL,
      },
    });
  }

  /** @override */
  async getUserName(): Promise<string> {
    const user = await this.#auth0Client.getUser();
    return user?.nickname ?? "";
  }

  /** @override */
  async getUserPictureURL(): Promise<string> {
    const user = await this.#auth0Client.getUser();
    return user?.picture ?? "";
  }

  /** @override */
  async getMail(): Promise<string> {
    const user = await this.#auth0Client.getUser();
    return user?.email ?? "";
  }

  /** @override */
  async isMailVerified(): Promise<boolean> {
    const user = await this.#auth0Client.getUser();
    return user?.email_verified ?? false;
  }

  /** @override */
  async deleteLoggedInUser(): Promise<void> {
    const accessToken = await this.#auth0Client.getTokenSilently();
    await deleteLoggedInUser(this.#restAPIURL, accessToken);
  }

  /** @override */
  async ping(): Promise<string> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await ping(websocket);
    return resp.message;
  }

  /** @override */
  async startCasualMatch(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<Battle> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await enterCasualMatch(websocket, armdozerId, pilotId);
    return createBattleSDKFromBattleStart(resp, websocket);
  }

  /** @override */
  async createPrivateMatchRoom(
    armdozerId: ArmDozerId,
    pilotId: PilotId
  ): Promise<PrivateMatchRoom> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await createPrivateMatchRoom(websocket, armdozerId, pilotId);
    return new PrivateMatchRoomSDK(resp.roomID, websocket);
  }

  /** @override */
  async enterPrivateMatchRoom(
    roomID: PrivateMatchRoomID,
    armdozerId: string,
    pilotId: string
  ): Promise<Battle | null> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await enterPrivateMatchRoom(
      websocket,
      roomID,
      armdozerId,
      pilotId
    );
    if (resp.action !== "battle-start") {
      return null;
    }

    return createBattleSDKFromBattleStart(resp, websocket);
  }

  /** @override */
  async disconnectWebsocket(): Promise<void> {
    this.#websocket && this.#websocket.close();
    this.#websocket = null;

    this.#websocketSubscriptions.forEach((v) => {
      v.unsubscribe();
    });

    this.#websocketSubscriptions = [];
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketError;
  }

  /**
   * WebSocketクライアントの取得を行う
   * WebSocketクライアントが存在しない場合は、本メソッド内で生成してから返す
   *
   * @return 取得、生成結果
   */
  async #getOrCreateWebSocket(): Promise<WebSocket> {
    if (this.#websocket) {
      return this.#websocket;
    }

    const accessToken = await this.#auth0Client.getTokenSilently();
    const websocket = await connect(
      `${this.#websocketAPIURL}?token=${accessToken}`
    );
    this.#websocketSubscriptions = [
      fromEvent(websocket, "error").subscribe(this.#websocketError),
      fromEvent(websocket, "close").subscribe(this.#websocketError),
    ];
    this.#websocket = websocket;
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
