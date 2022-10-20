// @flow
import { Observable } from "rxjs";

/** Websocket切断 */
export interface WebsocketDisconnect {
  /**
   * 内部的に保有するWebsocketコネクションを切断する
   *
   * @return 処理が完了したら発火するPromise
   */
  disconnectWebsocket(): Promise<void>;
}

/** Websocket エラー通知 */
export interface WebsocketErrorNotifier {
  /**
   * WebSocketのエラーを通知する
   *
   * @return 通知ストリーム
   */
  websocketErrorNotifier(): typeof Observable;
}

/** Websocket 意図しない切断通知 */
export interface WebsocketUnintentionalCloseNotifier {
  /**
   * Websocketが意図せず切断したことを通知する
   *
   * @return 通知ストリーム
   */
  websocketUnintentionalCloseNotifier(): typeof Observable;
}
