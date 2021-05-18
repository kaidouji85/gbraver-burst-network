// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import type {User} from "@gbraver-burst-network/core";
import {listenPortFromEnv} from "./listen-port-from-env";

dotenv.config();
const app = express();
const port = listenPortFromEnv();

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
  console.log(req.body);
  res.send({hp: 1000, power: 2000});
});