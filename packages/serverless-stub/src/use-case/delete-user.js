// @flow

import type {UseCase} from "./use-case";
import type {BrowserSDK} from "@gbraver-burst-network/browser-sdk";

/** ユーザ削除 ユースケース */
export class DeleteUserCase implements UseCase {
  _sdk: BrowserSDK

  /** コンストラクタ */
  constructor(sdk: BrowserSDK) {
    this._sdk = sdk;
  }

  /** @override */
  name(): string {
    return 'ユーザ削除';
  }

  /** @override */
  async execute(): Promise<void> {
    await this._sdk.deleteLoggedInUser();
  }
}