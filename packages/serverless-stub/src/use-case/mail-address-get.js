// @flow

import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import type { UseCase } from "./use-case";

/** メールアドレス取得 ユースケース */
export class MailAddressGet implements UseCase {
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
    return "メールアドレス取得";
  }

  /** @override */
  async execute(): Promise<void> {
    const isMailVerified = await this._sdk.getMail();
    console.log(isMailVerified);
  }
}
