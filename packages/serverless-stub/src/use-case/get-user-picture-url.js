// @flow

import type { BrowserSDK } from "@gbraver-burst-network/browser-sdk";

import type { UseCase } from "./use-case";

/** ユーザ画像URL取得 ユースケース */
export class GetUserPictureURLCase implements UseCase {
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
    return "ユーザ画像URL取得";
  }

  /** @override */
  async execute(): Promise<void> {
    const userPictureURL = await this._sdk.getUserPictureURL();
    console.log(userPictureURL);
  }
}
