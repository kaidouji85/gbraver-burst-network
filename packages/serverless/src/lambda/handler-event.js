// @flow

/** 認可情報 */
export type Authorizer = {
  /** プリンシパルID */
  principalId: string,
};

/** ハンドラ リクエストコンテクスト */
export type HandlerRequestContext = {
  /** コネクションID */
  connectionId: string,
  /** ドメイン名 */
  domainName: string,
  /** ステージ名 */
  stage: string,
  /** 認可情報 */
  authorizer: Authorizer
};

/** ハンドラのイベント */
export type HandlerEvent = {
  /** リクエストボディ */
  body?: string,
  /** リクエストコンテクスト */
  requestContext: HandlerRequestContext
};