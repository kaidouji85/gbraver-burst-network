import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";

import { ConnectionState } from "./connection-state";
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
  console.log(`a user connected: ${socket.id}`);
  connectionStates.set(socket.id, { type: "NoState" });

  socket.on("enterRoom", (data) => {
    const result = EnterRoomEventSchema.safeParse(data);
    if (!result.success) {
      socket.emit("error", { message: "Invalid data format" });
      return;
    }

    const enterRoom = result.data;
    connectionStates.set(socket.id, { ...enterRoom, type: "MatchMaking" });
  });

  socket.on("disconnect", () => {
    connectionStates.delete(socket.id);
    console.log(`user disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
