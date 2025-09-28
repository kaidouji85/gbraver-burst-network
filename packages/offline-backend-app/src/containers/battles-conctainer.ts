import { Battle } from "../core/battle";

/** バトル情報を管理するインターフェース */
export interface BattlesContainer {
  /**
   * バトル情報を取得する
   * @param battleId バトルID
   * @returns バトル情報、存在しない場合はnull
   */
  get(battleId: string): Battle | null;

  /**
   * バトル情報を設定する
   * @param battle 設定するバトル情報
   */
  set(battle: Battle): void;

  /**
   * バトル情報を削除する
   * @param battleId バトルID
   */
  delete(battleId: string): void;
}

/** インメモリで管理するバトル情報 */
export class InMemoryBattles implements BattlesContainer {
  /**
   * バトル情報のマップ
   * キーはバトルID
   * 値はバトル情報
   */
  #battles: Map<string, Battle> = new Map();

  /** @override */
  get(battleId: string): Battle | null {
    return this.#battles.get(battleId) ?? null;
  }

  /** @override */
  set(battle: Battle): void {
    this.#battles.set(battle.battleId, battle);
  }

  /** @override */
  delete(battleId: string): void {
    this.#battles.delete(battleId);
  }
}
