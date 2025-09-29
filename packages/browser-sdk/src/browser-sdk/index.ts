import {
  deleteUser,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";
import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { fromEvent, Observable, Subject, Subscription } from "rxjs";

import { connect } from "../websocket/connect";
import { createPrivateMatchRoom } from "../websocket/create-private-match-room";
import { enterCasualMatch } from "../websocket/enter-casual-match";
import { enterPrivateMatchRoom } from "../websocket/enter-private-match-room";
import { ping } from "../websocket/ping";
import { Battle } from "./battle-sdk";
import { CasualMatch } from "./casual-match";
import { createBattleSDKFromBattleStart } from "./create-battle-sdk-from-battle-start";
import { LoginCheck, Logout, UniversalLogin } from "./login";
import { Ping } from "./ping";
import {
  PrivateMatchCreate,
  PrivateMatchRoom,
  PrivateMatchRoomEnter,
  PrivateMatchRoomID,
} from "./private-match";
import { PrivateMatchRoomSDK } from "./private-match-room-sdk";
import {
  LoggedInUserDelete,
  UserMailGet,
  UserNameGet,
  UserPictureGet,
} from "./user";
import { WebsocketDisconnect, WebsocketErrorNotifier } from "./websocket";

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
    LoggedInUserDelete,
    WebsocketDisconnect,
    WebsocketErrorNotifier,
    PrivateMatchCreate,
    PrivateMatchRoomEnter {}

/** ブラウザSDK実装 */
class BrowserSDKImpl implements BrowserSDK {
  /** Web Socket APIのURL */
  #websocketAPIURL: string;
  /** Web Socket クライアント */
  #websocket: WebSocket | null;
  /** Web Socket エラー通知 */
  #websocketError: Subject<unknown>;
  /** Web Socket イベントストリーム */
  #websocketSubscriptions: Subscription[];

  /**
   * コンストラクタ
   * @param websocketAPIURL Websocket API のURL
   */
  constructor(websocketAPIURL: string) {
    this.#websocketAPIURL = websocketAPIURL;
    this.#websocket = null;
    this.#websocketError = new Subject();
    this.#websocketSubscriptions = [];
  }

  /** @override */
  async gotoLoginPage(): Promise<void> {
    await signInWithRedirect();
  }

  /** @override */
  async isLogin(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /** @override */
  async logout(): Promise<void> {
    await signOut();
  }

  /** @override */
  async getUserName(): Promise<string> {
    const userAttributes = await fetchUserAttributes();
    return userAttributes.preferred_username ?? userAttributes.email ?? "";
  }

  /** @override */
  async getUserPictureURL(): Promise<string | null> {
    const userAttributes = await fetchUserAttributes();
    return userAttributes.picture ?? null;
  }

  /** @override */
  async getMail(): Promise<string> {
    const userAttributes = await fetchUserAttributes();
    return userAttributes.email ?? "";
  }

  /** @override */
  async deleteLoggedInUser(): Promise<void> {
    await deleteUser();
  }

  /** @override */
  async ping(): Promise<string> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await ping(websocket);
    return resp.message;
  }

  /** @override */
  async startCasualMatch(
    armdozerId: ArmdozerId,
    pilotId: PilotId,
  ): Promise<Battle> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await enterCasualMatch(websocket, armdozerId, pilotId);
    return createBattleSDKFromBattleStart(resp, websocket);
  }

  /** @override */
  async createPrivateMatchRoom(
    armdozerId: ArmdozerId,
    pilotId: PilotId,
  ): Promise<PrivateMatchRoom> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await createPrivateMatchRoom(websocket, armdozerId, pilotId);
    return new PrivateMatchRoomSDK(resp.roomID, websocket);
  }

  /** @override */
  async enterPrivateMatchRoom(
    roomID: PrivateMatchRoomID,
    armdozerId: string,
    pilotId: string,
  ): Promise<Battle | null> {
    const websocket = await this.#getOrCreateWebSocket();
    const resp = await enterPrivateMatchRoom(
      websocket,
      roomID,
      armdozerId,
      pilotId,
    );
    if (resp.action !== "battle-start") {
      return null;
    }

    return createBattleSDKFromBattleStart(resp, websocket);
  }

  /** @override */
  async disconnectWebsocket(): Promise<void> {
    this.#websocket?.close();
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
   * @returns 取得、生成結果
   */
  async #getOrCreateWebSocket(): Promise<WebSocket> {
    if (this.#websocket) {
      return this.#websocket;
    }

    const authSession = await fetchAuthSession();
    const accessToken = authSession.tokens?.accessToken.toString() ?? "";
    const websocket = await connect(
      `${this.#websocketAPIURL}?token=${accessToken}`,
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
 * @param websocketAPIURL Websocket APIのURL
 * @returns GブレイバーバーストブラウザSDK
 */
export async function createBrowserSDK(
  websocketAPIURL: string,
): Promise<BrowserSDK> {
  return new BrowserSDKImpl(websocketAPIURL);
}
