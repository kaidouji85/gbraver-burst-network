import { EMPTY_PLAYER } from "gbraver-burst-core";

import {
  Battle,
  BattleID,
  BattlePlayer,
  FlowID,
} from "../../../src/core/battle";
import { BattleCommand } from "../../../src/core/battle-command";
import {
  CanBattleProgressQueryFromPoller,
  canProgressBattle,
} from "../../../src/core/can-battle-progress";
import { UserID } from "../../../src/core/user";

/** ポーリング実行プレイヤー */
const pollerPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "poller",
  userID: "poller",
  connectionId: "poller-connection",
};

/** ゲームに参加しているだけのプレイヤー */
const otherPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "other-player",
  userID: "other-player",
  connectionId: "other-player-connection",
};

/** バトル情報生成パラメータ */
type CreateBattleParams = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};

/**
 * バトル情報を生成する
 * @param params パラメータ
 * @returns 生成結果
 */
const createBattle = (params: CreateBattleParams): Battle<BattlePlayer> => ({
  ...params,
  players: [pollerPlayer, otherPlayer],
  poller: pollerPlayer.playerId,
  stateHistory: [],
});

/** バトルコマンド生成パラメータ */
type CreateCommandParams = {
  /** ユーザID */
  userID: UserID;
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};

/**
 * バトルコマンドを生成する
 * @param params 生成パラメータ
 * @returns 生成結果
 */
const createBattleCommand = (params: CreateCommandParams): BattleCommand => ({
  ...params,
  command: {
    type: "BATTERY_COMMAND",
    battery: 0,
  },
});

/** バトル進行クエリ */
const query: CanBattleProgressQueryFromPoller = {
  battleID: "query-battle",
  flowID: "query-flow",
};

test("バトルID、フローIDが一致していればバトル進行できる", () => {
  const battle = createBattle(query);
  const pollerPlayerCommand = createBattleCommand({
    ...query,
    userID: pollerPlayer.userID,
  });
  const otherPlayerCommand = createBattleCommand({
    ...query,
    userID: otherPlayer.userID,
  });
  expect(
    canProgressBattle(query, battle, [pollerPlayerCommand, otherPlayerCommand]),
  ).toBe(true);
});

test("フローIDが一致していなければバトル進行できない", () => {
  const battle = createBattle({ ...query, flowID: "non-matched-flow" });
  const pollerPlayerCommand = createBattleCommand({
    ...query,
    userID: pollerPlayer.userID,
  });
  const otherPlayerCommand = createBattleCommand({
    ...query,
    userID: otherPlayer.userID,
  });
  expect(
    canProgressBattle(query, battle, [pollerPlayerCommand, otherPlayerCommand]),
  ).toBe(false);
});

test("バトルIDが一致していなければバトル進行できない", () => {
  const battle = createBattle({ ...query, battleID: "non-matched-battle" });
  const pollerPlayerCommand = createBattleCommand({
    ...query,
    userID: pollerPlayer.userID,
  });
  const otherPlayerCommand = createBattleCommand({
    ...query,
    userID: otherPlayer.userID,
  });
  expect(
    canProgressBattle(query, battle, [pollerPlayerCommand, otherPlayerCommand]),
  ).toBe(false);
});
