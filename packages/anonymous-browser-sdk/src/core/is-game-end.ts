import { GameState } from "gbraver-burst-core";

/**
 * ゲーム終了か否かを判定する
 * @param state ゲームの状態履歴
 * @returns ゲームが終了している場合はtrue、それ以外はfalse
 */
export const isGameEnd = (state: GameState[]): boolean => {
  const lastState = state.at(-1);
  return lastState?.effect.name === "GameEnd";
};
