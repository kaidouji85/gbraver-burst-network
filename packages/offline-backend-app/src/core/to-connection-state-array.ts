import { ConnectionState } from "./connection-state";

/**
 * コネクションステートを配列で取得する
 * @param origin コネクションステートのマップ
 * @returns 配列で取得したコネクションステート
 */
export const toConnectionStateArray = (
  origin: Map<string, ConnectionState>,
): (ConnectionState & { socketId: string })[] =>
  Array.from(origin.entries()).map(([socketId, state]) => ({
    socketId,
    ...state,
  }));
