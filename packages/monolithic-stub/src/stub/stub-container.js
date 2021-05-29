// @flow

import type {Stub} from "./stub";
import {LoginStub} from "./login-stub";
import type {UserID} from "@gbraver-burst-network/core";
import {StartCasualMatchStub} from "./start-casual-match-stub";
import {InvalidUserLoginStub} from "./invalid-user-login-stub";

type Param = {
  url: string,
  userID: UserID,
  password: string,
  invalidUserID: UserID,
  invalidPassword: string,
};

/**
 * スタブコンテナを生成する
 *
 * @param param パラメータ
 * @return スタブコンテナ
 */
export function createStubContainer(param: Param): Stub[] {
  return [
    new LoginStub(param.url, param.userID, param.password),
    new StartCasualMatchStub(param.url, param.userID, param.password),
    new InvalidUserLoginStub(param.url, param.invalidUserID, param.invalidUserID),
  ];
}