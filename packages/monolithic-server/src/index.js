// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import type {User} from "@gbraver-burst-network/core";
import {listenPortFromEnv} from "./listen-port-from-env";
import {UsersFromJSON} from "./users-from-json";

dotenv.config();
const users = new UsersFromJSON();
const port = listenPortFromEnv();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`listening at ${port}`);
});

app.get('/', (req, res) => {
  const user: User = {id: 'hello world'};
  res.send(user);
});

app.post('/login', (req, res) => {
  const user = users.find(req.body.userID, req.body.password);
  const body = user ?? 'userID or password incorrect';
  res.send(body);
});