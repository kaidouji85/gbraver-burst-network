import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { startGBraverBurst } from "gbraver-burst-core";
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
import { createPlayer } from "./core/create-player";
import { matchMake } from "./core/match-make";
import { EnterRoomEventSchema } from "./socket-io-event/enter-room-event";

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
    battles.set({ battleId, flowId, stateHistory });
    players.forEach((p) => {
      const socket = io.sockets.sockets.get(p.socketId);
      connectionStates.set({ ...p, type: "InBattle" });
      socket?.emit("matched", {
        battleId,
        flowId,
        player: p.player,
        stateHistory,
      });
    });
  });
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

    const enterRoom = result.data;
    console.log(`a user(${socket.id}) entered room`);
    connectionStates.set({
      ...enterRoom,
      socketId: socket.id,
      type: "MatchMaking",
    });
    processMatchmaking();
  });

  /**
   * ソケットの切断処理
   */
  socket.on("disconnect", () => {
    connectionStates.delete(socket.id);
    console.log(`a user(${socket.id}) disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
