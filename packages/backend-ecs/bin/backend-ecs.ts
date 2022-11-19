#!/usr/bin/env node
import "source-map-support/register";

import { App, Fn } from "aws-cdk-lib";
import * as dotenv from "dotenv";
import * as R from "ramda";
import { v4 as uuidV4 } from "uuid";

import { BackendEcsStack } from "../lib/backend-ecs-stack";

dotenv.config();
const VPC_GENERATION = 2;
const service = process.env.SERVICE ?? "";
const stage = process.env.STAGE ?? "dev";
const matchMakeEcrRepositoryName =
  process.env.MATCH_MAKE_ECR_REPOSITORY_NAME ?? "";
const vpcStackId = `${service}-g${VPC_GENERATION}`;
const vpcId = Fn.importValue(`${vpcStackId}:VpcId`);
const subnetCount = Number.parseInt(Fn.importValue(`${vpcStackId}:SubnetCount`));
const subnetAzs: string[] = R.times(R.identity, subnetCount)
    .map(index => Fn.importValue(`${vpcStackId}:PublicNetAvailabilityZone${index}`));
const publicSubnetIds: string[] = R.times(R.identity, subnetCount)
    .map(index => Fn.importValue(`${vpcStackId}:PublicSubnetId${index}`));
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
  websocketAPIID,
  vpcId,
  subnetAzs,
  publicSubnetIds,
  connectionsTableARN,
  casualMatchEntriesTableARN,
  battlesTableARN,
  matchMakeEcrRepositoryName,
  uuid,
});
