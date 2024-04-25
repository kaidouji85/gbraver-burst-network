import {
  ArmdozerIds,
  Armdozers,
  Command,
  EMPTY_PLAYER,
  startGBraverBurst,
} from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { Battle, BattlePlayer } from "../../../src/core/battle";
import { BattleCommand } from "../../../src/core/battle-command";
import { progressBattle } from "../../../src/core/progress-battle";
import { mockUniqUUID } from "../../mock-unique-uuid";

jest.mock("uuid");

/** 攻撃側プレイヤー */
const attacker: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "attacker-player-id",
  userID: "attacker-userid",
  connectionId: "attacker--connection",
  armdozer:
    Armdozers.find((armdozer) => armdozer.id === ArmdozerIds.SHIN_BRAVER) ??
    Armdozers[0],
};

/** 防御側プレイヤー */
const defender: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "defender-player",
  userID: "defender-userid",
  connectionId: "defender-connection",
  armdozer:
    Armdozers.find((armdozer) => armdozer.id === ArmdozerIds.NEO_LANDOZER) ??
    Armdozers[0],
};

/** バトル情報 */
const battle: Battle<BattlePlayer> = {
  battleID: "test-battle",
  flowID: "test-flow",
  players: [defender, attacker],
  poller: defender.userID,
  stateHistory: startGBraverBurst([defender, attacker]).stateHistory(),
};

/**
 * 攻撃側プレイヤーのバトルコマンドを作成する
 * @param command コマンド
 * @returns 生成結果
 */
const createAttackerCommand = (command: Command): BattleCommand => ({
  userID: attacker.userID,
  battleID: battle.battleID,
  flowID: battle.flowID,
  command,
});

/**
 * 防御側プレイヤーのバトルコマンドを作成する
 * @param command コマンド
 * @returns 生成結果
 */
const createDefenderCommand = (command: Command): BattleCommand => ({
  userID: defender.userID,
  battleID: battle.battleID,
  flowID: battle.flowID,
  command,
});

beforeEach(() => {
  (uuidv4 as jest.Mock).mockImplementation(mockUniqUUID());
});

afterEach(() => {
  (uuidv4 as jest.Mock).mockReset();
});

test("バトル進行の結果、バトル継続となる", () => {
  const result = progressBattle(battle, [
    createAttackerCommand({ type: "BATTERY_COMMAND", battery: 2 }),
    createDefenderCommand({ type: "BATTERY_COMMAND", battery: 1 }),
  ]);
  expect(result).toMatchSnapshot();
});

test("バトル進行の結果、バトル終了となる", () => {
  const result = progressBattle(battle, [
    createAttackerCommand({ type: "BATTERY_COMMAND", battery: 4 }),
    createDefenderCommand({ type: "BATTERY_COMMAND", battery: 0 }),
  ]);
  expect(result).toMatchSnapshot();
});
