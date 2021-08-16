// @flow

/** 許可、拒否 */
export type Effect = 'Allow' | 'Deny';

/** ポリシードキュメントのステートメント */
export type Statement = {
  Action: "execute-api:Invoke",
  /** 効果 */
  Effect: Effect,
  /** リソース */
  Resource: string
};

/** ポリシードキュメント */
export type PolicyDocument = {
  Version: '2012-10-17',
  /** ステートメント */
  Statement: Statement[]
};

/** オーサライザが返すデータ */
export type AuthorizerResponse = {
  /** プリンシパルID */
  principalId: string,
  /** ポリシードキュメント */
  policyDocument: PolicyDocument
};

/**
 * 認可レスポンスを生成するヘルパー関数
 *
 * @param principalId プリンシパルID
 * @param resource リソース
 * @param effect エフェクト
 * @return レスポンス
 */
function createAuthorizeResponse(principalId: string, resource: string, effect: Effect): AuthorizerResponse {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource
      }]
    }
  };
}

/**
 * 認可成功時のレスポンス
 *
 * @param principalId プリンシパルID
 * @param resource リソース
 * @return レスポンス
 */
export function successAuthorize(principalId: string, resource: string): AuthorizerResponse {
 return createAuthorizeResponse(principalId, resource, 'Allow');
}

/**
 * 認可失敗時のレスポンス
 *
 * @param principalId プリンシパルID
 * @param resource リソース
 * @return レスポンス
 */
export function failedAuthorize(principalId: string, resource: string): AuthorizerResponse {
  return createAuthorizeResponse(principalId, resource, 'Deny');
}