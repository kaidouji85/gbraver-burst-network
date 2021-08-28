// @flow

import type {Player} from "gbraver-burst-core";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse = PingResponse | StartBattle;

/** pingのレスポンス */
export type PingResponse = {
  action: 'ping',
  /** メッセージ */
  message: string
};

/** バトルスタート */
export type StartBattle = {
  action: 'start-battle',
  /** プレイヤー情報 */
  player: Player,
  /** 敵情報 */
  enemy: Player,
  /** ステートヒストリー */
  stateHistory: GameState[],
  /** 戦闘ID */
  battleID: string,
  /** フローID */
  flowID: string,
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