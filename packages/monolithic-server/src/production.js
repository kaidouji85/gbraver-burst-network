// @flow
import dotenv from 'dotenv';
import {monolithicServer} from './app/monolithic-server';
import {UsersFromMongo} from './users/users-from-mongo';
import {connect} from 'mongoose';

dotenv.config();

const mongoDBConnect = process.env.MONGO_DB_CONNECT ?? '';
connect(mongoDBConnect, {useNewUrlParser: true, useUnifiedTopology: true});

const portFromEnv = parseInt(process.env.LISTEN_PORT);
const listenPort = isNaN(portFromEnv) ? 4000 : portFromEnv;
const accessControlOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN ?? '';
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? '';
const users = UsersFromMongo;
monolithicServer({listenPort, accessTokenSecret, accessControlOrigin, users});