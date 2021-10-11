#!/usr/bin/env node
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {BackendEcsStack} from '../lib/backend-ecs-stack';

dotenv.config();
const stage = process.env.STAGE ?? 'dev';
const app = new cdk.App();
new BackendEcsStack(app, `gbraver-burst-backend-ecs-${stage}`, stage);
