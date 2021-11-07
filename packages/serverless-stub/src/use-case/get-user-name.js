// @flow

import type {UseCase} from "./use-case";
import type {BrowserSDK} from "@gbraver-burst-network/browser-sdk";

/** ユーザ名取得 ユースケース */
export class GetUserNameCase implements UseCase {
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
    return 'ユーザ名取得';
  }

  /** @override */
  async execute(): Promise<void> {
    const userName = await this._sdk.getUserName();
    console.log(userName);
  }
}