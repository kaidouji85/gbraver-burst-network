#!/usr/bin/env node
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {BackendEcsStack} from '../lib/backend-ecs-stack';

dotenv.config();

const stage = process.env.STAGE ?? 'dev';
const matchMakeEcrRepositoryName = process.env.MATCH_MAKE_ECR_REPOSITORY_NAME ?? '';
const matchMakeEcrTag = process.env.MATCH_MAKE_ECR_TAG ?? '';
const vpcId = cdk.Fn.importValue('gbraver-burst-vpc:VpcId');
const privateNetAvailabilityZone = cdk.Fn.importValue('gbraver-burst-vpc:PrivateNetAvailabilityZone');
const privateSubnetId = cdk.Fn.importValue('gbraver-burst-vpc:PrivateSubnetId');
const websocketAPIID = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:WebsoketApiId`);
const connectionsTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:ConnectionsTableArn`);
const casualMatchEntriesTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:CasualMatchEntriesTableArn`);
const battlesTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:BattlesTableArn`);

const app = new cdk.App();
new BackendEcsStack(app, `gbraver-burst-backend-ecs-${stage}`, {stage, vpcId, privateNetAvailabilityZone, privateSubnetId,
  websocketAPIID, connectionsTableARN, casualMatchEntriesTableARN, battlesTableARN, matchMakeEcrRepositoryName, matchMakeEcrTag
});
