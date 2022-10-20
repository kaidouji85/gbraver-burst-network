// @flow

import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import type { UseCase } from "./use-case";

/** メール認証状態取得 ユースケース */
export class MailVerifiedCase implements UseCase {
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
    return "メール認証状態取得";
  }

  /** @override */
  async execute(): Promise<void> {
    const isMailVerified = await this._sdk.isMailVerified();
    console.log(isMailVerified);
  }
}
