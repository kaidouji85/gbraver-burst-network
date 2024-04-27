/**
 * ログイン成功時のリダイレクトか否かを判定する
 * trueでログイン成功時のリダイレクトである
 *
 * @returns 判定結果
 */
export function isLoginSuccessRedirect(): boolean {
  const query = window.location.search;
  return query.includes("code=") && query.includes("state=");
}

/**
 * ログインリダイレクトのヒストリーをクリアする
 */
export function clearLoginHistory(): void {
  window.history.replaceState({}, document.title, "/");
}
