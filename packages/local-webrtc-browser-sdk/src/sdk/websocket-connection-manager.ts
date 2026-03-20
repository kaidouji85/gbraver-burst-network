import { fromEvent, Observable, Subject, Subscription } from "rxjs";
import { connectWSSignal } from "../ws-signal/connect-ws-signal";

export class WebSocketConnectionManager {
  /** WebSocketシグナルサーバーのURL */
  readonly wsSignalUrl: string;
  /** WebSocketコネクション */
  #websocket: WebSocket | null = null;
  /** Web Socket エラー通知 */
  #websocketError: Subject<unknown>;
  /** Web Socket イベントストリーム */
  #websocketSubscriptions: Subscription[];

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.wsSignalUrl = wsSignalUrl;
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

    const websocket = await connectWSSignal(this.wsSignalUrl);
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
