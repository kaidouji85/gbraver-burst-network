// @flow
import dotenv from 'dotenv';
import {monolithicServer} from './app/monolithic-server';
import {UsersFromJSON} from "./users/users-from-json";

dotenv.config();

const portFromEnv = parseInt(process.env.LISTEN_PORT);
const listenPort = isNaN(portFromEnv) ? 4000 : portFromEnv;
const accessControlOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN ?? '';
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? '';
const users = new UsersFromJSON('users.json');
monolithicServer({listenPort, accessControlOrigin, accessTokenSecret, users});