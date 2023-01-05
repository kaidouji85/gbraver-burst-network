/** 認可情報 */
export type Authorizer = {
  /** プリンシパルID */
  principalId: string;
};

/** websocket api リクエストコンテクスト */
export type WebsocketAPIRequestContext = {
  /** コネクションID */
  connectionId: string;

  /** ドメイン名 */
  domainName: string;

  /** ステージ名 */
  stage: string;

  /** 認可情報 */
  authorizer: Authorizer;
};

/** websocket api イベント */
export type WebsocketAPIEvent = {
  /** リクエストボディ */
  body?: string;

  /** リクエストコンテクスト */
  requestContext: WebsocketAPIRequestContext;
};