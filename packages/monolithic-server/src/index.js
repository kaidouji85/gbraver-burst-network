// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import {listenPortFromEnv} from "./listen-port-from-env";
import {UsersFromJSON} from "./users-from-json";
import {createAccessToken, validAccessTokenOnly} from "./auth";
import type {AccessToken} from "./auth";

dotenv.config();
const users = new UsersFromJSON();
const port = listenPortFromEnv();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // TODO 本番公開時はoriginを明確に指定する
  cors: {
    origin: "*",
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
  }
});

// TODO 本番公開時はoriginを明確に指定する
app.use(cors());
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const user = users.find(req.body.userID, req.body.password);
  if (!user) {
    res.send('userID or password incorrect');
    return;
  }

  const accessToken = createAccessToken(user);
  const body = {accessToken};
  res.send(body);
});

app.get('/login', validAccessTokenOnly, (req, res) => {
  const accessToken: AccessToken = req.gbraverBurstAccessToken;
  res.send(`hello ${accessToken.userID} access token valid`);
});

io.on('connection', () => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`listening at ${port}`);
  console.log(`env ${app.get('env')}`);
});