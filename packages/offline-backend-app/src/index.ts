import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import PQueue from "p-queue";
import { Server } from "socket.io";

import {
  BattlesContainer,
  InMemoryBattles,
} from "./containers/battles-conctainer";
import {
  ConnectionStatesContainer,
  InMemoryConnectionStates,
} from "./containers/connection-states-container";
import { InBattle } from "./core/connection-state";
import { updateCommand } from "./core/update-command";
import { processMatchmaking } from "./process-matchmaking";
import { progressBattle } from "./progress-battle";
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
      processMatchmaking({ connectionStates, battles, io });
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
      progressBattle({ 
        battle: updatedBattle,
        connectionStates, 
        battles, 
        io 
      });
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
