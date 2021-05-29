// @flow

import express from 'express';
import type {PasswordUserFinder} from "../users/password-user-finder";
import {createAccessToken, loginOnlyForExpress} from "../auth/auth";
import type {AccessTokenPayload} from "../auth/auth";

/**
 * ログイン処理
 *
 * @param userFinder ユーザ検索
 * @return ルーター
 */
export function loginRouter(userFinder: PasswordUserFinder): typeof express.Router {
  const router = express.Router();

  router.post('/', (req, res) => {
    const user = userFinder.findUser(req.body.userID, req.body.password);
    if (!user) {
      res.sendStatus(401);
      return;
    }

    const accessToken = createAccessToken(user);
    const body = {accessToken};
    res.send(body);
  });

  router.get('/', loginOnlyForExpress, (req, res) => {
    const accessToken: AccessTokenPayload = req.gbraverBurstAccessToken;
    res.send(`hello ${accessToken.userID} access token valid`);
  });

  return router;
}
