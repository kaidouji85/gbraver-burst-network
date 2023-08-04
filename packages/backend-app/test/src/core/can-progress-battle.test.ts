import { Command, EMPTY_PLAYER } from "gbraver-burst-core";

import { Battle, BattleID, BattlePlayer, FlowID } from "../../../src/core/battle";
import { BattleCommand } from "../../../src/core/battle-command";
import { BattleProgressQuery } from "../../../src/core/battle-progress-query";
import { canProgressBattle } from "../../../src/core/can-battle-progress";

/** ポーリング実行プレイヤー */
const pollerPlayer: BattlePlayer = { 
  ...EMPTY_PLAYER, 
  playerId: "poller",
  userID: "poller",
  connectionId: "poller-connection"
};

/** ゲームに参加しているだけのプレイヤー */
const otherPlayer: BattlePlayer = { 
  ...EMPTY_PLAYER, 
  playerId: "other-player",
  userID: "other-player",
  connectionId: "other-player-connection"
};

/** バトル情報生成パラメータ */
type CreateBattleParams = {
  /** バトルID */
  battleID: BattleID,
  /** フローID */ 
  flowID: FlowID
};

/**
 * バトル情報を生成する
 * @param params パラメータ
 * @return 生成結果
 */
const createBattle = (params: CreateBattleParams): Battle<BattlePlayer> => ({
  ...params,
  players: [pollerPlayer, otherPlayer],
  poller: pollerPlayer.playerId,
  stateHistory: []
});

/** バトル進行クエリ */
const query: BattleProgressQuery = {
  battleID: "query-battle",
  flowID: "query-flow",
};

/** 入力するコマンド */
const command: Command = {
  type: "BATTERY_COMMAND",
  battery: 0
};

test("バトルID、フローIDが一致してりればバトル進行できる", () => {
  const battle = createBattle(query);
  const pollerPlayerCommand: BattleCommand = {
    ...query,
    userID: pollerPlayer.userID,
    command
  };
  const otherPlayerCommand: BattleCommand = {
    ...query,
    userID: otherPlayer.userID,
    command,
  };
  expect(canProgressBattle(query, battle, [pollerPlayerCommand, otherPlayerCommand])).toBe(true);
});