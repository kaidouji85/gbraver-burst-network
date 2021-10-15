// @flow

/** クエリパラメータをセットしたオブジェクト */
export type QueryStringParameters = {
  /** トークン */
  token: string
};

/** オーサライザ リクエストコンテクスト */
export type AuthorizerRequestContext = {
  /** コネクションID */
  connectionId: string,
  /** ドメイン名 */
  domainName: string,
  /** ステージ名 */
  stage: string
};

/** オーサライザのイベント */
export type AuthorizerEvent = {
  /**
   * オーサライザに渡されるmethodArn
   * 詳細は以下URLを参照
   * https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
   */
  methodArn: string,
  /** リクエストパラメータ */
  queryStringParameters: QueryStringParameters,
  /** リクエスト コンテクスト */
  requestContext: AuthorizerRequestContext,
};