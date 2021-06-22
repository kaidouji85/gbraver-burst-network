// @flow

import express from 'express';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';
import type {PasswordUserFinder} from "../users/password-user-finder";
import {loginRouter} from "../router/login";
import {loginOnlyForSocketIO} from "../auth/login-only";
import {AccessToken} from "../auth/access-token";
import {SessionContainer, FirstArrivalRoom, BattleRoomContainer} from "@gbraver-burst-network/core";
import {CasualMatch} from "../socket.io/handler/casual-match";
import {BattleRoom} from '../socket.io/handler/battle-room';
import {SocketFetcher} from "../socket.io/fetcher/socket-fetcher";

/** モノリシックサーバで利用するUserの機能 */
interface OwnUsers extends PasswordUserFinder {}

/** モノリシックサーバのパラメータ */
type Param = {
  listenPort: number,
  accessControllOrigin: string,
  accessTokenSecret: string,
  users: OwnUsers,
};

/**
 * モノリシックサーバを起動する
 * 
 * @param param パラメータ
 */
export function monolithicServer(param: Param): void {
  const accessToken = new AccessToken(param.accessTokenSecret);
  const sessions = new SessionContainer();
  const waitingRoom = new FirstArrivalRoom();
  const battleRooms = new BattleRoomContainer();
  
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: param.accessControllOrigin,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
    }
  });
  const socketFetcher = new SocketFetcher(io);
  
  app.use(cors({
    origin: param.accessControllOrigin
  }));
  app.use(express.json());
  app.use('/login', loginRouter(param.users, accessToken, sessions));
  
  io.use(loginOnlyForSocketIO(accessToken, sessions));
  io.on('connection', socket => {
    console.log('a user connected');
    socket.on('CasualMatch', CasualMatch(socket, socketFetcher, waitingRoom, battleRooms));
    socket.on('BattleRoom', BattleRoom(socket, socketFetcher, battleRooms));
  });
  
  server.listen(param.listenPort, () => {
    console.log(`listening at ${param.listenPort}`);
    console.log(`env ${app.get('env')}`);
  });
}