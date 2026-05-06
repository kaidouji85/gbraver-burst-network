/**
 * HTTP API用のオーソライザー
 * @returns 認証結果
 */
export const authorizer = async () => {
  return { isAuthorized: true };
};
