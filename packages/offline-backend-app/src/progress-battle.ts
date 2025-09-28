import { Player, restoreGBraverBurst } from "gbraver-burst-core";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import { BattlesContainer } from "./containers/battles-conctainer";
import { ConnectionStatesContainer } from "./containers/connection-states-container";
import { Battle } from "./core/battle";
import { shouldBattleProgress } from "./core/should-battle-progress";

/**
 * バトルの進行処理を行う
 * @param options オプション
 * @param options.battle バトル情報
 * @param options.connectionStates コネクションステート管理
 * @param options.battles バトル情報管理
 * @param options.io Socket.IOサーバーインスタンス
 */
export const progressBattle = (options: {
  battle: Battle;
  connectionStates: ConnectionStatesContainer;
  battles: BattlesContainer;
  io: Server;
}) => {
  const { battle, connectionStates, battles, io } = options;

  if (!shouldBattleProgress(battle)) {
    return;
  }

  const battleStates = connectionStates
    .toArray()
    .filter((state) => state.type === "InBattle")
    .filter((state) => state.battleId === battle.battleId);
  if (battleStates.length !== 2) {
    return;
  }

  const { stateHistory } = battle;
  const players: [Player, Player] = [
    battleStates[0].player,
    battleStates[1].player,
  ];
  const core = restoreGBraverBurst({ players, stateHistory });
  const commands = Array.from(battle.commands.values());
  if (commands.length !== 2) {
    return;
  }

  const updatedStateHistory = core.progress([commands[0], commands[1]]);
  const isGameEnd = updatedStateHistory.at(-1)?.effect.name === "GameEnd";
  if (isGameEnd) {
    battles.delete(battle.battleId);
    battleStates.forEach((state) => {
      const socket = io.sockets.sockets.get(state.socketId);
      socket?.emit("gameEnded", { updatedStateHistory });
      connectionStates.set({ type: "NoState", socketId: state.socketId });
    });
    return;
  }

  const newFlowId = uuidv4();
  const updatedBattle = {
    ...battle,
    flowId: newFlowId,
    stateHistory: [...battle.stateHistory, ...updatedStateHistory],
  };
  console.log(`a battle(${battle.battleId}) progressed`);
  battles.set(updatedBattle);
  battleStates.forEach((state) => {
    const socket = io.sockets.sockets.get(state.socketId);
    socket?.emit("progressed", {
      flowId: newFlowId,
      updatedStateHistory,
    });
  });
};
