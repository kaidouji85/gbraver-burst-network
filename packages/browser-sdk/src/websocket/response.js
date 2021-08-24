// @flow

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse = PingResponse;

/** pingのレスポンス */
export type PingResponse = {
  action: 'ping',
  /** メッセージ */
  message: string
};

/**
 * 任意のオブジェクトをPingResponseにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元となる文字列
 * @return パース結果
 */
export function parsePingResponse(data: Object): ?PingResponse {
  return ((data?.action === 'ping') && (typeof data?.message === 'string'))
    ? ({action: data.action, message: data.message})
    : null;
}