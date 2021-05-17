// @flow

/**
 * 環境変数からListenPortを取得する
 * 環境変数にポート番号以外の数字が入力されていた場合、
 * デフォルト値として4000番ポートを返す
 *
 * @return ポート番号
 */
export function listenPortFromEnv(): number {
  const port = parseInt(process.env.LISTEN_PORT);
  return isNaN(port) ? 4000 : port;
}