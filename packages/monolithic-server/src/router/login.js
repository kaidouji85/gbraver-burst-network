// @flow

import express from 'express';
import type {PasswordUserFinder} from "../users/password-user-finder";
import type {AccessTokenCreator, AccessTokenPayloadParser, AccessTokenPayload} from "../auth/access-token";
import {loginOnlyForExpress} from "../auth/login-only";

/** ログイン処理で利用するアクセストークンユーティリティの機能 */
interface AccessTokenForLogin extends AccessTokenCreator, AccessTokenPayloadParser {}

/**
 * ログイン処理
 *
 * @param users ユーザ検索
 * @param accessToken アクセストークンユーティリティ
 * @return ルーター
 */
export function loginRouter(users: PasswordUserFinder, accessToken: AccessTokenForLogin): typeof express.Router {
  const router = express.Router();

  router.post('/', (req, res) => {
    const user = users.findUser(req.body.userID, req.body.password);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const token = accessToken.createAccessToken(user);
    const body = {accessToken: token};
    res.send(body);
  });

  router.get('/', loginOnlyForExpress(accessToken), (req, res) => {
    const accessToken: AccessTokenPayload = req.gbraverBurstAccessToken;
    res.send(`hello ${accessToken.userID} access token valid`);
  });

  return router;
}
