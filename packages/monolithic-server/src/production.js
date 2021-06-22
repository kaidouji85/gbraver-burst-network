// @flow
import dotenv from 'dotenv';
import {monolithicServer} from './app/monolithic-server';
import {listenPortFromEnv} from "./port/listen-port";
import {accessTokenSecretFromEnv} from "./auth/access-token-secret";
import {UsersFromMongo} from './users/users-from-mongo';
import {connect} from 'mongoose';

dotenv.config();
const mongoDBConnect = process.env.MONGO_DB_CONNECT ?? '';
connect(mongoDBConnect, {useNewUrlParser: true, useUnifiedTopology: true});

monolithicServer({
  listenPort: listenPortFromEnv(),
  accessControllOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN ?? '',
  accessTokenSecret: accessTokenSecretFromEnv(),
  users: UsersFromMongo,
});