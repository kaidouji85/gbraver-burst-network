// @flow

import type {BattleID, FlowID} from "../dto/battle";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";
import type {Player} from "gbraver-burst-core";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse = BattleProgressed | BattleStart | Error;

/** バトル進行通知 */
export type BattleProgressed = {
  action: 'battle-progressed',
  /** 発行されたフローID */
  flowID: FlowID,
  /** 更新されたゲームステート */
  update: GameState[],
};

/** 戦闘開始 */
export type BattleStart = {
  action: 'battle-start',
  /** プレイヤー情報 */
  player: Player,
  /** 敵情報 */
  enemy: Player,
  /** 戦闘ID */
  battleID: BattleID,
  /** フローID */
  flowID: FlowID,
  /** 戦闘進捗ポーリングを実行する側か否か、trueでポーリングをする */
  isPoller: boolean
};

/** エラー */
export type Error = {
  action: 'error',
  error: any,
};