import { createServer } from "node:http";

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";

dotenv.config();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8080";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
