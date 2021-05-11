// @flow

import express from 'express';
import type {User} from "@gbraver-burst-network/core";

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const user: User = {id: 'hello world'};
  res.send(user);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});