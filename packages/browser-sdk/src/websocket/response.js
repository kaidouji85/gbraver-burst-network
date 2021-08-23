// @flow

import {parseJSON} from "../json/parse";

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse = PingResponse;

/** pingのレスポンス */
export type PingResponse = {
  action: 'ping',
  /** メッセージ */
  message: string
};

/**
 * 文字列をpingレスポンスにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元となる文字列
 * @return パース結果
 */
export function parsePingResp(data: string): ?PingResponse {
  const json = parseJSON(data);
  if (!json) {
    return null;
  }

  return ((json?.action === 'ping') && (typeof json?.message === 'string'))
    ? ({action: json.action, message: json.message})
    : null;
}