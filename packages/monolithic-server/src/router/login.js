// @flow

import express from 'express';
import type {PasswordUserFinder} from "../users/password-user-finder";
import type {AccessTokenCreator, AccessTokenPayloadParser} from "../auth/access-token";
import {loginOnlyForExpress} from "../auth/login-only";
import {createSessionFromUser} from "@gbraver-burst-network/core";
import type {AddSession, FindSession} from "@gbraver-burst-network/core";

/** ログイン処理で利用するアクセストークンユーティリティの機能 */
interface AccessTokenForLogin extends AccessTokenCreator, AccessTokenPayloadParser {}

/** ログイン処理で利用するセッションコンテナの機能 */
interface SessionsForLogin extends AddSession, FindSession {}

/**
 * ログイン処理
 *
 * @param users ユーザ検索
 * @param accessToken アクセストークンユーティリティ
 * @param sessions セッションコンテナ
 * @return ルーター
 */
export function loginRouter(users: PasswordUserFinder, accessToken: AccessTokenForLogin, sessions: SessionsForLogin): typeof express.Router {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const user = await users.findUser(req.body.userID, req.body.password);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const session = createSessionFromUser(user);
    sessions.add(session);

    const token = accessToken.createAccessToken(session);
    const body = {accessToken: token};
    res.send(body);
  });

  router.get('/', loginOnlyForExpress(accessToken), (req, res) => {
    res.send('valid access token.');
  });

  return router;
}
