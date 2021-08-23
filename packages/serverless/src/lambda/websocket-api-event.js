// @flow

import type {User} from '../dto/user';

/** 認可情報 */
export type Authorizer = {
  /** プリンシパルID */
  principalId: string,
};

/** websocket api リクエストコンテクスト */
export type WebsocketAPIRequestContext = {
  /** コネクションID */
  connectionId: string,
  /** ドメイン名 */
  domainName: string,
  /** ステージ名 */
  stage: string,
  /** 認可情報 */
  authorizer: Authorizer
};

/** websocket api イベント */
export type WebsocketAPIEvent = {
  /** リクエストボディ */
  body?: string,
  /** リクエストコンテクスト */
  requestContext: WebsocketAPIRequestContext
};

/**
 * 認可情報からユーザ情報を抽出する
 * 
 * @param authorizer 抽出元となる認可情報
 * @return 抽出したユーザ情報
 */
export function extractUser(authorizer: Authorizer): User {
  return {userID: authorizer.principalId};
}