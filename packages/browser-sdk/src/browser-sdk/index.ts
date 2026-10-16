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

import { AbortManager } from "../abort-controller/abort-manager";
import { SignalContainer } from "../abort-controller/signal-container";
import { connect } from "../websocket/connect";
import { createPrivateMatchRoom } from "../websocket/create-private-match-room";
import { enterCasualMatch } from "../websocket/enter-casual-match";
import { enterPrivateMatchRoom } from "../websocket/enter-private-match-room";
import { ping } from "../websocket/ping";
import { BattleSDK } from "./battle/battle";
import { createBattleSDKFromBattleStart } from "./battle/create-battle-sdk-from-battle-start";
import { CasualMatch } from "./casual-match";
import { LoginCheck, Logout, UniversalLogin } from "./login";
import { Ping } from "./ping";
import {
  PrivateMatchCreate,
  PrivateMatchRoom,
  PrivateMatchRoomEnter,
  PrivateMatchRoomID,
} from "./private-match/private-match";
import { PrivateMatchRoomImpl } from "./private-match/private-match-room-impl";
import {
  LoggedInUserDelete,
  UserMailGet,
  UserNameGet,
  UserPictureGet,
} from "./user";
import { WebsocketDisconnect, WebsocketErrorNotifier } from "./websocket";

/** ブラウザSDK */
export interface BrowserSDK
  extends
    UniversalLogin,
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
  /** Web Socket 用の AbortManager */
  #websocketAbortManager: AbortManager;
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
    this.#websocketAbortManager = new AbortManager();
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
    const { signal } = this.#websocketAbortManager.getAbortController();
    const websocket = await this.#getOrCreateWebSocket({ signal });
    const resp = await ping(websocket, { signal });
    return resp.message;
  }

  /** @override */
  async startCasualMatch(
    armdozerId: ArmdozerId,
    pilotId: PilotId,
  ): Promise<BattleSDK> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const websocket = await this.#getOrCreateWebSocket({ signal });
    const resp = await enterCasualMatch(websocket, armdozerId, pilotId, {
      signal,
    });
    return createBattleSDKFromBattleStart(
      resp,
      websocket,
      this.#websocketAbortManager,
    );
  }

  /** @override */
  async createPrivateMatchRoom(
    armdozerId: ArmdozerId,
    pilotId: PilotId,
  ): Promise<PrivateMatchRoom> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const websocket = await this.#getOrCreateWebSocket({ signal });
    const resp = await createPrivateMatchRoom(websocket, armdozerId, pilotId, {
      signal,
    });
    return new PrivateMatchRoomImpl(
      resp.roomID,
      websocket,
      this.#websocketAbortManager,
    );
  }

  /** @override */
  async enterPrivateMatchRoom(
    roomID: PrivateMatchRoomID,
    armdozerId: string,
    pilotId: string,
  ): Promise<BattleSDK | null> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const websocket = await this.#getOrCreateWebSocket({ signal });
    const resp = await enterPrivateMatchRoom(
      websocket,
      roomID,
      armdozerId,
      pilotId,
      { signal },
    );
    if (resp.action !== "battle-start") {
      return null;
    }

    return createBattleSDKFromBattleStart(
      resp,
      websocket,
      this.#websocketAbortManager,
    );
  }

  /** @override */
  async disconnectWebsocket(): Promise<void> {
    this.#websocketSubscriptions.forEach((v) => {
      v.unsubscribe();
    });
    this.#websocketSubscriptions = [];

    this.#websocket?.close();
    this.#websocket = null;

    this.#websocketAbortManager.getAbortController().abort();
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketError;
  }

  /**
   * WebSocketクライアントの取得を行う
   * WebSocketクライアントが存在しない場合は、本メソッド内で生成してから返す
   * @param options オプション
   * @returns 取得、生成結果
   */
  async #getOrCreateWebSocket(options: SignalContainer): Promise<WebSocket> {
    const { signal } = options;
    if (signal.aborted) {
      throw new Error(signal.reason);
    }

    if (this.#websocket) {
      return this.#websocket;
    }

    const authSession = await fetchAuthSession();
    const accessToken = authSession.tokens?.accessToken.toString() ?? "";
    const websocket = await connect(
      `${this.#websocketAPIURL}?token=${accessToken}`,
      options,
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
