import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import {
  Player,
  restoreGBraverBurst,
  startGBraverBurst,
} from "gbraver-burst-core";
import PQueue from "p-queue";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import {
  BattlesContainer,
  InMemoryBattles,
} from "./containers/battles-conctainer";
import {
  ConnectionStatesContainer,
  InMemoryConnectionStates,
} from "./containers/connection-states-container";
import { Battle } from "./core/battle";
import { InBattle } from "./core/connection-state";
import { createPlayer } from "./core/create-player";
import { matchMake } from "./core/match-make";
import { shouldBattleProgress } from "./core/should-battle-progress";
import { updateCommand } from "./core/update-command";
import { EnterRoomEventSchema } from "./socket-io-event/enter-room-event";
import { SendCommandSchema } from "./socket-io-event/send-command";

dotenv.config();

/** CORS許可オリジン */
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8080";

/** サーバーポート番号 */
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

/** コネクションステート管理 */
const connectionStates: ConnectionStatesContainer =
  new InMemoryConnectionStates();

/** バトル情報管理 */
const battles: BattlesContainer = new InMemoryBattles();

/** キュー制御 */
const queue = new PQueue({ concurrency: 1 });

/**
 * マッチメイキング処理を行う
 */
const processMatchmaking = () => {
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

/**
 * バトルの進行処理を行う
 * @param battle バトル情報
 */
const progressBattle = (battle: Battle) => {
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

/**
 * プレイヤー切断時のバトルクリーンアップ処理を行う
 * バトルを削除し、対戦相手がいる場合は終了通知を送信する
 * @param state 切断されたコネクションのInBattleステート
 */
const cleanupBattleOnDisconnect = (state: InBattle) => {
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

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`a user(${socket.id}) connected`);
  connectionStates.set({ type: "NoState", socketId: socket.id });

  /**
   * ルームに入室する
   * @param data ユーザーから渡された入室データ
   */
  socket.on("enterRoom", (data) => {
    const result = EnterRoomEventSchema.safeParse(data);
    if (!result.success) {
      socket.emit("error", { message: "Invalid data format" });
      return;
    }

    queue.add(() => {
      const enterRoom = result.data;
      console.log(`a user(${socket.id}) entered room`);
      connectionStates.set({
        ...enterRoom,
        socketId: socket.id,
        type: "MatchMaking",
      });
      processMatchmaking();
    });
  });

  /**
   * クライアントがコマンドを送信する
   * @param data ユーザーから渡されたコマンドデータ
   */
  socket.on("sendCommand", (data) => {
    console.log(`a user(${socket.id}) sent command`);
    const parsedData = SendCommandSchema.safeParse(data);
    if (!parsedData.success) {
      socket.emit("error", { message: "Invalid data format" });
      return;
    }

    queue.add(() => {
      const sendCommand = parsedData.data;
      const state = connectionStates.get(socket.id);
      if (!sendCommand || state?.type !== "InBattle") {
        socket.emit("error", { message: "No in battle" });
        return;
      }

      const battle = battles.get(state.battleId);
      if (!battle) {
        socket.emit("error", { message: "Not found battle" });
        return;
      }

      const updatedBattle = updateCommand({
        battle,
        command: { ...sendCommand, playerId: state.player.playerId },
      });
      battles.set(updatedBattle);
      progressBattle(updatedBattle);
    });
  });

  /**
   * ソケットの切断処理
   */
  socket.on("disconnect", () => {
    console.log(`a user(${socket.id}) disconnected`);
    queue.add(() => {
      const state = connectionStates.get(socket.id);
      connectionStates.delete(socket.id);
      if (state?.type === "InBattle") {
        cleanupBattleOnDisconnect(state);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
