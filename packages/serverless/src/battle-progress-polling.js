// @flow

import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import type {WebsocketAPIResponse} from "./lambda/websocket-api-response";
import {parseBattleProgressPolling} from "./lambda/battle-progress-polling";

/**
 * バトル更新用のポーリング
 * プレイヤーのコマンドが揃っている場合はバトルを進め、
 * そうでない場合は何もしない
 *
 * @param event イベント
 * @return 本関数が終了したら発火するPromise
 */
export async function battleProgressPolling(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const data = parseBattleProgressPolling(event.body);
  if (!data) {
    return {statusCode: 400, body: 'invalid request body'};
  }

  return {statusCode: 200, body: 'send command success'};
}