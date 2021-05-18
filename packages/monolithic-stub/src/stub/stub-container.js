// @flow

import type {Stub} from "./stub";
import {LoginStub} from "./login-stub";
import type {UserID} from "@gbraver-burst-network/core";

/**
 * スタブコンテナを生成する
 *
 * @param url APIサーバのパスワード
 * @param userID ユーザID
 * @param password パスワード
 * @return スタブコンテナ
 */
export function createStubContainer(url: string, userID: UserID, password: string): Stub[] {
  return [
    new LoginStub(url, userID, password)
  ];
}