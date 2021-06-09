// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import {listenPortFromEnv} from "./listen-port";
import {UsersFromJSON} from "./users/users-from-json";
import {loginRouter} from "./router/login";
import {loginOnlyForSocketIO} from "./auth/login-only";
import {AccessToken} from "./auth/access-token";
import {accessTokenSecretFromEnv} from "./auth/access-token-secret";
import {SessionContainer, FirstArrivalRoom, BattleRoomContainer} from "@gbraver-burst-network/core";
import {CasualMatch} from "./socket.io/handler/casual-match";
import {SocketFetcher} from "./socket.io/fetcher/socket-fetcher";

dotenv.config();

const port = listenPortFromEnv();
const origin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;

const users = new UsersFromJSON();
const accessToken = new AccessToken(accessTokenSecretFromEnv());
const sessions = new SessionContainer();
const waitingRoom = new FirstArrivalRoom();
const battleRoomContainer = new BattleRoomContainer();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: origin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
  }
});
const socketFetcher = new SocketFetcher(io);

app.use(cors({
  origin: origin
}));
app.use(bodyParser.json());
app.use('/login', loginRouter(users, accessToken, sessions));

io.use(loginOnlyForSocketIO(accessToken));

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('CasualMatch', CasualMatch(socket, socketFetcher, waitingRoom, battleRoomContainer));
});

server.listen(port, () => {
  console.log(`listening at ${port}`);
  console.log(`env ${app.get('env')}`);
});