import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { Server, Socket } from "socket.io";

import { ConnectionState } from "./connection-state";
import { MatchEntry } from "./match-entry";
import { EnterRoomEventSchema } from "./socket-io-event/enter-room-event";

dotenv.config();

/** CORS許可オリジン */
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8080";

/** サーバーポート番号 */
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

/**
 * コネクションのステートを管理するマップ
 * key: socket.id
 * value: ConnectionState
 */
const connectionStates = new Map<string, ConnectionState>();

/**
 * キャッシュされたマッチングのエントリー
 * nullの場合はキャッシュされていない
 */
let cachedMatchEntry: MatchEntry | null = null;

/**
 * マッチメイキング処理を行う
 * 待機中のプレイヤーがいれば即座にマッチングし、いなければ待機状態にする
 * @param options - マッチメイキングに必要な情報
 * @param options.socket - プレイヤーのSocket.IOソケット
 * @param options.armdozerId - プレイヤーのアームドーザID
 * @param options.pilotId - プレイヤーのパイロットID
 */
const processMatchmaking = async (options: {
  socket: Socket;
  armdozerId: ArmdozerId;
  pilotId: PilotId;
}) => {
  const { socket } = options;
  const myEntry = { ...options, connectionId: socket.id };
  if (!cachedMatchEntry) {
    cachedMatchEntry = myEntry;
    return;
  }

  const otherSocket = io.sockets.sockets.get(cachedMatchEntry.connectionId);
  if (!otherSocket) {
    cachedMatchEntry = myEntry;
    return;
  }

  // ユニークなルームIDになるようにする
  const roomId = "room-id";
  socket.join(roomId);
  otherSocket.join(roomId);
  await io.to(roomId).emitWithAck("matched", {});

  cachedMatchEntry = null;
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
  connectionStates.set(socket.id, { type: "NoState" });

  socket.on("enterRoom", (data) => {
    const result = EnterRoomEventSchema.safeParse(data);
    if (!result.success) {
      socket.emit("error", { message: "Invalid data format" });
      return;
    }

    const enterRoom = result.data;
    connectionStates.set(socket.id, { ...enterRoom, type: "MatchMaking" });
    console.log(`a user(${socket.id}) entered room`);
    processMatchmaking({ ...enterRoom, socket });
  });

  socket.on("disconnect", () => {
    connectionStates.delete(socket.id);
    console.log(`a user(${socket.id}) disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
