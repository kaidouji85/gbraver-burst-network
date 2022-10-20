// @flow

import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import type { UseCase } from "./use-case";

/** Websocket切断 ユースケース */
export class DisconnectWebsocketCase implements UseCase {
  _sdk: BrowserSDK;

  /**
   * コンストラクタ
   *
   * @param sdk Gブレイバーバースト ブラウザSDK
   */
  constructor(sdk: BrowserSDK) {
    this._sdk = sdk;
  }

  /** @override */
  name(): string {
    return "Websocket切断";
  }

  /** @override */
  async execute(): Promise<void> {
    await this._sdk.ping();
    await this._sdk.disconnectWebsocket();
  }
}
