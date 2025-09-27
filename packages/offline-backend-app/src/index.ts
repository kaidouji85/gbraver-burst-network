import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { startGBraverBurst } from "gbraver-burst-core";
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
import { InBattle } from "./core/connection-state";
import { createPlayer } from "./core/create-player";
import { matchMake } from "./core/match-make";
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
 * @param options - マッチメイキングに必要な情報
 * @param options.socket - プレイヤーのSocket.IOソケット
 * @param options.armdozerId - プレイヤーのアームドーザID
 * @param options.pilotId - プレイヤーのパイロットID
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
 * 必要であればバトルを破棄する
 * 本関数はコネクションが切断された時に、それ以外の終了処理を行うものである
 * @param state 切断されたコネクションのInBattleステート
 */
const destroyBattleIfNeeded = (state: InBattle) => {
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

  socket.on("sendCommand", (data) => {
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
        destroyBattleIfNeeded(state);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
