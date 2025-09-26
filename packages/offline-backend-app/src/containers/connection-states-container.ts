import { ConnectionState } from "../core/connection-state";

/** コネクションステートの管理インタフェース */
export interface ConnectionStatesContainer {
  /**
   * コネクションステートを取得する
   * @param socketId ソケットID
   * @returns コネクションステート、存在しない場合はnull
   */
  get(socketId: string): ConnectionState | null;

  /**
   * コネクションステートを設定する
   * @param state コネクションステート
   */
  set(state: ConnectionState): void;

  /**
   * コネクションステートを削除する
   * @param socketId ソケットID
   */
  delete(socketId: string): void;

  /**
   * コネクションステートを配列で取得する
   * @returns コネクションステートの配列
   */
  toArray(): ConnectionState[];
}

/** インメモリで管理するコネクションステート */
export class InMemoryConnectionStates implements ConnectionStatesContainer {
  /**
   * コネクションステートのマップ
   * キーはソケットID
   * 値はコネクションステート
   */
  #states: Map<string, ConnectionState> = new Map();

  /** @override */
  get(socketId: string): ConnectionState | null {
    return this.#states.get(socketId) ?? null;
  }

  /** @override */
  set(state: ConnectionState): void {
    this.#states.set(state.socketId, state);
  }

  /** @override */
  delete(socketId: string): boolean {
    return this.#states.delete(socketId);
  }

  /** @override */
  toArray(): ConnectionState[] {
    return Array.from(this.#states.values());
  }
}
