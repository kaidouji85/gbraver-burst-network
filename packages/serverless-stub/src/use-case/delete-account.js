// @flow

import type {UseCase} from "./use-case";
import type {BrowserSDK} from "@gbraver-burst-network/browser-sdk";

/** アカウント削除 ユースケース */
export class DeleteAccountCase implements UseCase {
  _sdk: BrowserSDK

  /** コンストラクタ */
  constructor(sdk: BrowserSDK) {
    this._sdk = sdk;
  }

  /** @override */
  name(): string {
    return 'アカウント削除';
  }

  /** @override */
  async execute(): Promise<void> {
    await this._sdk.deleteLoggedInAccount();
  }
}