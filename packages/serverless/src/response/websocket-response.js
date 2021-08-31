// @flow

import type {BattleID, FlowID} from "../dto/battle";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";
import type {Player} from "gbraver-burst-core";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  EnteredCasualMatch |
  AcceptCommand |
  BattleStart |
  NotReadyBattleProgress |
  BattleProgressed |
  BattleEnd |
  SuddenlyBattleEnd |
  Error;

/** カジュアルマッチ入室成功 */
export type EnteredCasualMatch = {
  action: 'entered-casual-match',
};

/** コマンド受取通知 */
export type AcceptCommand = {
  action: 'accept-command',
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

/** バトル進行の準備ができていない */
export type NotReadyBattleProgress = {
  action: 'not-ready-battle-progress',
};

/** バトル進行通知 */
export type BattleProgressed = {
  action: 'battle-progressed',
  /** 発行されたフローID */
  flowID: FlowID,
  /** 更新されたゲームステート */
  update: GameState[],
};

/** バトル強制終了 */
export type SuddenlyBattleEnd = {
  action: 'suddenly-battle-end',
};

/** バトル終了 */
export type BattleEnd = {
  action: 'battle-end',
  /** 更新されたゲームステート */
  update: GameState[],
};

/** エラー */
export type Error = {
  action: 'error',
  error: any,
};