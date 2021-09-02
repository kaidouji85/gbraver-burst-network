// @flow

/** コマンド受取通知 */
export type AcceptCommand = {
  action: 'accept-command',
};

/**
 * 任意オブジェクトをAcceptCommandにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseAcceptCommand(data: Object): ?AcceptCommand {
  return (data?.action === 'accept-command')
    ? {action: data.action}
    : null;
}