// @flow

import type {UseCase} from "./use-case";
import type {BrowserSDK} from "@gbraver-burst-network/browser-sdk";

/** ping ユースケース */
export class PingUseCase implements UseCase {
  _sdk: BrowserSDK

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
    return 'ping';
  }

  /** @override */
  async execute(): Promise<void> {
    const data = await this._sdk.ping();
    console.log(data);
  }
}