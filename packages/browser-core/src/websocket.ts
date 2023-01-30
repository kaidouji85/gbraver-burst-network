import { Observable } from "rxjs";

/** Websocket切断 */
export interface WebsocketDisconnect {
  /**
   * 内部的に保有するWebsocketコネクションを切断する
   *
   * @return 処理が完了したら発火するPromise
   */
  disconnectWebsocket(): Promise<unknown>;
}

/** Websocket エラー通知 */
export interface WebsocketErrorNotifier {
  /**
   * WebSocketのエラーを通知する
   *
   * @return 通知ストリーム
   */
  websocketErrorNotifier(): Observable<unknown>;
}
