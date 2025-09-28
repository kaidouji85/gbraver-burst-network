import { startGBraverBurst } from "gbraver-burst-core";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import { BattlesContainer } from "./containers/battles-conctainer";
import { ConnectionStatesContainer } from "./containers/connection-states-container";
import { createPlayer } from "./core/create-player";
import { matchMake } from "./core/match-make";

/**
 * マッチメイキング処理を行う
 * @param options オプション
 * @param options.connectionStates コネクションステート管理
 * @param options.battles バトル情報管理
 * @param options.io Socket.IOサーバーインスタンス
 */
export const processMatchmaking = (options: {
  connectionStates: ConnectionStatesContainer;
  battles: BattlesContainer;
  io: Server;
}) => {
  const { connectionStates, battles, io } = options;

  const entries = connectionStates
    .toArray()
    .filter((state) => state.type === "MatchMaking");
  const matched = matchMake(entries);
  matched.forEach((pair) => {
    const battleId = uuidv4();
    const flowId = uuidv4();
    const players = pair.map((entry) => ({
      socketId: entry.socketId,
      player: createPlayer(entry),
    }));

    const core = startGBraverBurst([players[0].player, players[1].player]);
    const stateHistory = core.stateHistory();
    console.log(`a battle(${battleId}) started`);
    battles.set({ battleId, flowId, stateHistory, commands: new Map() });
    players.forEach((p) => {
      const socket = io.sockets.sockets.get(p.socketId);
      connectionStates.set({ ...p, type: "InBattle", battleId });
      socket?.emit("matched", {
        battleId,
        flowId,
        player: p.player,
        stateHistory,
      });
    });
  });
};
