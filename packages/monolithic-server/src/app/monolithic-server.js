// @flow

import express from 'express';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';
import type {PasswordUserFinder} from "../users/password-user-finder";
import {loginRouter} from "../router/login";
import {loginOnlyForSocketIO} from "../auth/login-only";
import {AccessToken} from "../auth/access-token";
import {CasualMatch} from "../socket.io/handler/casual-match";
import {BattleRoom} from '../socket.io/handler/battle-room';
import {Disconnect} from "../socket.io/handler/disconnect";
import {noSameUserSocket} from "../auth/no-same-user-socket";
import {FirstArrivalRoom} from "../waiting-room/first-arrival-room";
import {BattleRoomContainer} from "../battle-room/battle-room-container";

/** モノリシックサーバで利用するUserの機能 */
interface OwnUsers extends PasswordUserFinder {}

/** モノリシックサーバのパラメータ */
type Param = {
  listenPort: number,
  accessControlOrigin: string,
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
  const waitingRoom = new FirstArrivalRoom();
  const battleRooms = new BattleRoomContainer();
  
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: param.accessControlOrigin,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
    }
  });
  
  app.use(cors({
    origin: param.accessControlOrigin
  }));
  app.use(express.json());
  app.use('/login', loginRouter(param.users, accessToken));
  
  io.use(loginOnlyForSocketIO(accessToken));
  io.use(noSameUserSocket(io));
  io.on('connection', socket => {
    console.log('a user connected');
    socket.on('CasualMatch', CasualMatch(socket, io, waitingRoom, battleRooms));
    socket.on('BattleRoom', BattleRoom(socket, io, battleRooms));
    socket.on('disconnect', Disconnect(socket, io, waitingRoom, battleRooms))
  });
  
  server.listen(param.listenPort, () => {
    console.log(`listening at ${param.listenPort}`);
    console.log(`env ${app.get('env')}`);
  });
}