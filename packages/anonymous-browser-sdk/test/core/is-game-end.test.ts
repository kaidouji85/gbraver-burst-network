import { EMPTY_GAME_STATE, GameState } from "gbraver-burst-core";

import { isGameEnd } from "../../src/core/is-game-end";

/** ゲームエンド */
const gameEnd: GameState = {
  ...EMPTY_GAME_STATE,
  effect: {
    name: "GameEnd",
    result: { type: "EvenMatch" },
  },
};

/** ゲームエンド以外 */
const otherState: GameState = {
  ...EMPTY_GAME_STATE,
  effect: {
    name: "StartGame",
  },
};

test("最新のゲームステートがGameEndの場合、ゲーム終了である", () => {
  expect(isGameEnd([otherState, gameEnd])).toBe(true);
});

test("最新のゲームステートがGameEndではない場合、ゲーム終了ではない", () => {
  expect(isGameEnd([otherState, otherState])).toBe(false);
});

test("ゲームステートがGameEndだけでも、ゲーム終了である", () => {
  expect(isGameEnd([gameEnd])).toBe(true);
});

test("ゲームステート履歴が空の場合、ゲーム終了ではない", () => {
  expect(isGameEnd([])).toBe(false);
});
