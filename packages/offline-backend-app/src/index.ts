import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
