// @flow
import dotenv from 'dotenv';
import {monolithicServer} from './app/monolithic-server';
import {listenPortFromEnv} from "./port/listen-port";
import {UsersFromJSON} from "./users/users-from-json";
import {accessTokenSecretFromEnv} from "./auth/access-token-secret";

dotenv.config();

monolithicServer({
  listenPort: listenPortFromEnv(),
  accessControllOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN ?? '',
  accessTokenSecret: accessTokenSecretFromEnv(),
  users: new UsersFromJSON('users.json'),
});