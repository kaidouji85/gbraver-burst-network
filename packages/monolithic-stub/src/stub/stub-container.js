// @flow

import type {Stub} from "./stub";
import {LoginStub} from "./login-stub";
import {StartCasualMatchStub} from "./start-casual-match-stub";
import {InvalidUserLoginStub} from "./invalid-user-login-stub";
import type {UserLogin} from "./user-login";

/** スタブコンテナのパラメータ */
type Param = {
  url: string,
  user1: UserLogin,
  user2: UserLogin,
  invalidUser: UserLogin,
};

/**
 * スタブコンテナを生成する
 *
 * @param param パラメータ
 * @return スタブコンテナ
 */
export function createStubContainer(param: Param): Stub[] {
  return [
    new LoginStub(param.url, param.user1),
    new StartCasualMatchStub(param.url, param.user1, param.user2),
    new InvalidUserLoginStub(param.url, param.invalidUser),
  ];
}