import { BattleStart } from "../response/battle-start";
import { BattleSDK } from "./battle-sdk";

/**
 * BattleStartからBattleSDKを生成する
 * @param battleStart BattleStartのデータ
 * @param websocket websocketクライアント
 * @returns 生成結果
 */
export function createBattleSDKFromBattleStart(
  battleStart: BattleStart,
  websocket: WebSocket,
): BattleSDK {
  return new BattleSDK({
    player: battleStart.player,
    enemy: battleStart.enemy,
    initialState: battleStart.stateHistory,
    battleID: battleStart.battleID,
    initialFlowID: battleStart.flowID,
    isPoller: battleStart.isPoller,
    websocket,
  });
}
