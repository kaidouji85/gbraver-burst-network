import { fromEvent, Observable, Subject, Unsubscribable } from "rxjs";

import { SignalContainer } from "../abort-controller/signal-container";
import { connectWSSignal } from "../websocket-api/connect-ws-signal";
import { AuthTokenManager } from "./auth-token-manager";

/** WebSocketコネクションおよび関連オブジェクト */
type Connection = {
  /** WebSocketコネクション */
  websocket: WebSocket;
  /** WebSocketコネクションストリームのアンサブスクライバ */
  websocketSubscriptions: Unsubscribable[];
};

/** WebSocketコネクション管理 */
export class WebSocketConnectionManager {
  /** WebSocketシグナルサーバーのURL */
  readonly wsSignalUrl: string;
  /** 認証トークンマネージャー */
  #authToken: AuthTokenManager;
  /** Web Socket エラー通知 */
  #websocketError: Subject<unknown>;
  /** コネクション情報、nullで未接続 */
  #connection: Promise<Connection> | null = null;

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
  }

  /**
   * WebSocketクライアントの取得を行う
   * WebSocketクライアントが存在しない場合は、本メソッド内で生成してから返す
   * @param options オプション
   * @param options.signal アボートシグナル
   * @returns 取得、生成結果
   */
  getOrCreate(options?: Partial<SignalContainer>): Promise<WebSocket> {
    const signal = options?.signal;
    if (this.#connection) {
      return this.#connection.then((v) => v.websocket);
    }

    this.#connection = (async () => {
      const authToken = await this.#authToken.getOrIssueAuthToken({ signal });
      const websocket = await connectWSSignal(
        this.wsSignalUrl,
        authToken.token,
        { signal },
      );
      const websocketSubscriptions = [
        fromEvent(websocket, "error").subscribe(this.#websocketError),
        fromEvent(websocket, "close").subscribe(this.#websocketError),
      ];
      return { websocket, websocketSubscriptions };
    })().catch((err) => {
      this.#connection = null;
      throw err;
    });

    return this.#connection.then((v) => v.websocket);
  }

  /**
   * Websocketコネクションを切断する
   * 本メソッドを呼び出すことで、WebSocketコネクションに関連するイベントストリームの購読も解除する
   */
  gracefulDisconnect(): void {
    if (!this.#connection) {
      return;
    }

    this.#connection.then((v) => {
      v.websocket.close();
      v.websocketSubscriptions.forEach((s) => s.unsubscribe());
    });
    this.#connection = null;
  }

  /**
   * WebSocketのエラーを通知する
   * @returns 通知ストリーム
   */
  errorNotifier(): Observable<unknown> {
    return this.#websocketError;
  }
}
