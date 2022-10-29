#!/usr/bin/env node
import "source-map-support/register";

import { App, Fn } from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { v4 as uuidV4 } from "uuid";

import { BackendEcsStack } from "../lib/backend-ecs-stack";

dotenv.config();

const service = process.env.SERVICE ?? "";
const stage = process.env.STAGE ?? "dev";
const matchMakeEcrRepositoryName =
  process.env.MATCH_MAKE_ECR_REPOSITORY_NAME ?? "";
const vpcId = Fn.importValue(`${service}:VpcId`);
const publicSubnetAvailabilityZone = Fn.importValue(
  `${service}:PulicNetAvailabilityZone`
);
const publicSubnetId = Fn.importValue(`${service}:PulicSubnetId`);
const websocketAPIID = Fn.importValue(`${service}:${stage}:WebsoketApiId`);
const connectionsTableARN = Fn.importValue(
  `${service}:${stage}:ConnectionsTableArn`
);
const casualMatchEntriesTableARN = Fn.importValue(
  `${service}:${stage}:CasualMatchEntriesTableArn`
);
const battlesTableARN = Fn.importValue(`${service}:${stage}:BattlesTableArn`);
const uuid = uuidV4();

const app = new App();
new BackendEcsStack(app, `${service}-${stage}-backend-ecs`, {
  service,
  stage,
  vpcId,
  publicSubnetAvailabilityZone,
  publicSubnetId,
  websocketAPIID,
  connectionsTableARN,
  casualMatchEntriesTableARN,
  battlesTableARN,
  matchMakeEcrRepositoryName,
  uuid,
});
