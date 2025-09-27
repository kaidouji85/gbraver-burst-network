import { PlayerId } from "gbraver-burst-core";

import { Battle, BattleCommand } from "../../src/core/battle";
import { shouldBattleProgress } from "../../src/core/should-battle-progress";

/**
 * テスト用のBattleCommandを作成するヘルパー関数
 * @param playerId プレイヤーID
 * @param flowId フローID
 * @returns BattleCommand型のテストデータ
 */
const createBattleCommand = (
  playerId: PlayerId,
  flowId: string,
): BattleCommand => ({
  playerId,
  flowId,
  command: { type: "BATTERY_COMMAND", battery: 1 },
});

/**
 * テスト用のBattleを作成するヘルパー関数
 * @param battleId バトルID
 * @param flowId フローID
 * @param commands コマンドのMap
 * @returns Battle型のテストデータ
 */
const createBattle = (
  battleId: string = "test-battle-id",
  flowId: string = "test-flow-id",
  commands: Map<PlayerId, BattleCommand> = new Map(),
): Battle => ({
  battleId,
  flowId,
  stateHistory: [],
  commands,
});

/** テストプレイヤー1のID */
const player1Id: PlayerId = "player1";
/** テストプレイヤー2のID */
const player2Id: PlayerId = "player2";
/** テスト用のフローID */
const testFlowId = "test-flow-id";

test("両プレイヤーから同じflowIdのコマンドが届いている場合、trueを返す", () => {
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, testFlowId)],
    [player2Id, createBattleCommand(player2Id, testFlowId)],
  ]);
  const battle = createBattle("battle1", testFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(true);
});

test("コマンドが1つもない場合、falseを返す", () => {
  const battle = createBattle("battle1", testFlowId, new Map());
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});

test("コマンドが1つしかない場合、falseを返す", () => {
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, testFlowId)],
  ]);
  const battle = createBattle("battle1", testFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});

test("コマンドが3つ以上ある場合、falseを返す", () => {
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, testFlowId)],
    [player2Id, createBattleCommand(player2Id, testFlowId)],
    ["player3", createBattleCommand("player3" as PlayerId, testFlowId)],
  ]);
  const battle = createBattle("battle1", testFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});

test("2つのコマンドがあるが、1つのflowIdがbattle.flowIdと異なる場合、falseを返す", () => {
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, testFlowId)],
    [player2Id, createBattleCommand(player2Id, "different-flow-id")],
  ]);
  const battle = createBattle("battle1", testFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});

test("2つのコマンドがあるが、両方ともbattle.flowIdと異なる場合、falseを返す", () => {
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, "wrong-flow-id-1")],
    [player2Id, createBattleCommand(player2Id, "wrong-flow-id-2")],
  ]);
  const battle = createBattle("battle1", testFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});

test("空文字列のflowIdでも同じなら、falseを返す", () => {
  const emptyFlowId = "";
  const commands = new Map<PlayerId, BattleCommand>([
    [player1Id, createBattleCommand(player1Id, emptyFlowId)],
    [player2Id, createBattleCommand(player2Id, emptyFlowId)],
  ]);
  const battle = createBattle("battle1", emptyFlowId, commands);
  const result = shouldBattleProgress(battle);
  expect(result).toBe(false);
});
