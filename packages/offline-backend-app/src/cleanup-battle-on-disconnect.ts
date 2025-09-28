import { Server } from "socket.io";

import { BattlesContainer } from "./containers/battles-conctainer";
import { ConnectionStatesContainer } from "./containers/connection-states-container";
import { InBattle } from "./core/connection-state";

/**
 * プレイヤー切断時のバトルクリーンアップ処理を行う
 * バトルを削除し、対戦相手がいる場合は終了通知を送信する
 * @param options バトルクリーンアップに必要な依存関係
 * @param options.state 切断されたコネクションのInBattleステート
 * @param options.connectionStates コネクションステート管理
 * @param options.battles バトル情報管理
 * @param options.io Socket.IOサーバーインスタンス
 */
export const cleanupBattleOnDisconnect = (options: {
  state: InBattle;
  connectionStates: ConnectionStatesContainer;
  battles: BattlesContainer;
  io: Server;
}) => {
  const { state, connectionStates, battles, io } = options;

  battles.delete(state.battleId);

  const otherState = connectionStates
    .toArray()
    .find(
      (s) =>
        s.type === "InBattle" &&
        s.battleId === state.battleId &&
        s.socketId !== state.socketId,
    );
  if (!otherState) {
    return;
  }

  io.sockets.sockets
    .get(otherState.socketId)
    ?.emit("error", { message: "battle ended" });
  connectionStates.set({ type: "NoState", socketId: otherState.socketId });
};
