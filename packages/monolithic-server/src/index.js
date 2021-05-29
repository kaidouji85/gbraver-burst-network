// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import {listenPortFromEnv} from "./listen-port";
import {UsersFromJSON} from "./users/users-from-json";
import {loginOnlyForSocketIO} from "./auth/auth";
import {loginRouter} from "./router/login";

dotenv.config();
const users = new UsersFromJSON();
const port = listenPortFromEnv();
const origin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: origin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
  }
});

app.use(cors({
  origin: origin
}));
app.use(bodyParser.json());
app.use('/login', loginRouter(users));

io.use(loginOnlyForSocketIO);

io.on('connection', () => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`listening at ${port}`);
  console.log(`env ${app.get('env')}`);
});