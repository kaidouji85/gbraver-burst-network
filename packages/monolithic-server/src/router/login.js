// @flow

import express from 'express';
import type {PasswordUserFinder} from "../users/password-user-finder";
import type {AccessTokenEncoder, AccessTokenPayloadDecoder} from "../auth/access-token";
import {loginOnlyForExpress} from "../auth/login-only";
import {createSessionFromUser as createSession} from "@gbraver-burst-network/core";
import {toPayload} from "../auth/access-token-payload";

/** ログイン処理で利用するアクセストークンユーティリティの機能 */
interface AccessTokenForLogin extends AccessTokenEncoder, AccessTokenPayloadDecoder {}

/**
 * ログイン処理
 *
 * @param users ユーザ検索
 * @param accessToken アクセストークンユーティリティ
 * @return ルーター
 */
export function loginRouter(users: PasswordUserFinder, accessToken: AccessTokenForLogin): typeof express.Router {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const user = await users.findUser(req.body.userID, req.body.password);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const session = createSession(user);
    const payload = toPayload(session);
    const token = accessToken.encode(payload);
    const body = {accessToken: token};
    res.send(body);
  });

  router.get('/', loginOnlyForExpress(accessToken), (req, res) => {
    res.send('valid access token.');
  });

  return router;
}
