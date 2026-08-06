import { fromEvent, Observable, Subject, Subscription } from "rxjs";

import { connectWSSignal } from "../websocket/connect-ws-signal";
import { AuthTokenManager } from "./auth-token-manager";

/** WebSocketコネクション管理 */
export class WebSocketConnectionManager {
  /** WebSocketシグナルサーバーのURL */
  readonly wsSignalUrl: string;
  /** 認証トークンマネージャー */
  #authToken: AuthTokenManager;
  /** WebSocketコネクション */
  #websocket: WebSocket | null = null;
  /** Web Socket エラー通知 */
  #websocketError: Subject<unknown>;
  /** Web Socket イベントストリーム */
  #websocketSubscriptions: Subscription[];

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.wsSignalUrl WebSocketシグナルサーバーのURL
   * @param options.authToken 認証トークンマネージャー
   */
  constructor(options: { wsSignalUrl: string; authToken: AuthTokenManager }) {
    this.wsSignalUrl = options.wsSignalUrl;
    this.#authToken = options.authToken;
    this.#websocketError = new Subject();
    this.#websocketSubscriptions = [];
  }

  /**
   * WebSocketクライアントの取得を行う
   * WebSocketクライアントが存在しない場合は、本メソッド内で生成してから返す
   * @returns 取得、生成結果
   */
  async getOrCreate(): Promise<WebSocket> {
    if (this.#websocket) {
      return this.#websocket;
    }

    const authToken = await this.#authToken.getOrIssueAuthToken();
    const websocket = await connectWSSignal(this.wsSignalUrl, authToken.token);
    this.#websocketSubscriptions = [
      fromEvent(websocket, "error").subscribe(this.#websocketError),
      fromEvent(websocket, "close").subscribe(this.#websocketError),
    ];
    this.#websocket = websocket;
    return websocket;
  }

  /**
   * Websocketコネクションを切断する
   * 本メソッドを呼び出すことで、WebSocketコネクションに関連するイベントストリームの購読も解除する
   */
  gracefulDisconnect(): void {
    this.#websocket?.close();
    this.#websocket = null;

    this.#websocketSubscriptions.forEach((v) => {
      v.unsubscribe();
    });
    this.#websocketSubscriptions = [];
  }

  /**
   * WebSocketのエラーを通知する
   * @returns 通知ストリーム
   */
  errorNotifier(): Observable<unknown> {
    return this.#websocketError;
  }
}
