#!/usr/bin/env node
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {BackendEcsStack} from '../lib/backend-ecs-stack';

dotenv.config();

const service = 'gbraver-burst-serverless';
const stage = process.env.STAGE ?? 'dev';
const matchMakeEcrRepositoryName = process.env.MATCH_MAKE_ECR_REPOSITORY_NAME ?? '';
const vpcId = cdk.Fn.importValue('gbraver-burst-vpc:VpcId');
const privateNetAvailabilityZone = cdk.Fn.importValue('gbraver-burst-vpc:PrivateNetAvailabilityZone');
const privateSubnetId = cdk.Fn.importValue('gbraver-burst-vpc:PrivateSubnetId');
const websocketAPIID = cdk.Fn.importValue(`${service}:${stage}:WebsoketApiId`);
const connectionsTableARN = cdk.Fn.importValue(`${service}:${stage}:ConnectionsTableArn`);
const casualMatchEntriesTableARN = cdk.Fn.importValue(`${service}:${stage}:CasualMatchEntriesTableArn`);
const battlesTableARN = cdk.Fn.importValue(`${service}:${stage}:BattlesTableArn`);

const app = new cdk.App();
new BackendEcsStack(app, `${service}__${stage}__backend-ecs`, {service, stage, vpcId, privateNetAvailabilityZone, privateSubnetId,
  websocketAPIID, connectionsTableARN, casualMatchEntriesTableARN, battlesTableARN, matchMakeEcrRepositoryName
});
