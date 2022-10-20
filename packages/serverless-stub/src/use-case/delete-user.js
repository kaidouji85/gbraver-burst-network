// @flow

import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import type { UseCase } from "./use-case";

/** ユーザ削除 ユースケース */
export class DeleteUserCase implements UseCase {
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
    return "ユーザ削除";
  }

  /** @override */
  async execute(): Promise<void> {
    await this._sdk.deleteLoggedInUser();
  }
}
