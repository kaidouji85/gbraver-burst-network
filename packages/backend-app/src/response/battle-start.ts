import { Player, GameState } from "gbraver-burst-core";

import { Battle, BattleID, BattlePlayer, FlowID } from "../core/battle";
import { toPlayer } from "../core/to-player";
import { UserID } from "../core/user";

/** 戦闘開始 */
export type BattleStart = {
  action: "battle-start";
  /** プレイヤー情報 */
  player: Player;
  /** 敵情報 */
  enemy: Player;
  /** 戦闘ID */
  battleID: BattleID;
  /** ステートヒストリー */
  stateHistory: GameState[];
  /** フローID */
  flowID: FlowID;
  /** 戦闘進捗ポーリングを実行する側か否か、trueでポーリングをする */
  isPoller: boolean;
};

/**
 * 戦闘開始オブジェクトを生成するヘルパー関数
 * @template X プレイヤー情報のデータ型
 * @param userID 戦闘開始オブジェクトを受け取るユーザのID
 * @param battle バトル情報
 * @returns 生成結果
 */
export function createBattleStart<X extends BattlePlayer>(
  userID: UserID,
  battle: Battle<X>,
): BattleStart {
  const player =
    battle.players.find((v) => v.userID === userID) ?? battle.players[0];
  const respPlayer = toPlayer(player);
  const enemy =
    battle.players.find((v) => v.userID !== userID) ?? battle.players[0];
  const respEnemy = toPlayer(enemy);
  const isPoller = userID === battle.poller;
  return {
    action: "battle-start",
    player: respPlayer,
    enemy: respEnemy,
    battleID: battle.battleID,
    flowID: battle.flowID,
    stateHistory: battle.stateHistory,
    isPoller,
  };
}
