// @flow

/** Websocket切断 */
export interface WebsocketDisconnect {
  /**
   * 内部的に保有するWebsocketコネクションを切断する
   *
   * @return 処理が完了したら発火するPromise
   */
  disconnectWebsocket(): Promise<void>;
}