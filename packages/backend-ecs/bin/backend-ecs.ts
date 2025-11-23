#!/usr/bin/env node
import "source-map-support/register";

import { App, Fn } from "aws-cdk-lib";
import * as dotenv from "dotenv";
import * as R from "ramda";

import { BackendEcsStack } from "../lib/backend-ecs-stack";

/** VPC世代数 */
const VPC_GENERATION = 4;

dotenv.config();

const service = process.env.SERVICE ?? "";
const stage = process.env.STAGE ?? "dev";
const matchMakeImageUri = process.env.MATCH_MAKE_IMAGE_URI ?? "";
const vpcSubnetCount = Number.parseInt(process.env.VPC_SUBNET_COUNT ?? "");

const vpcStackId = `${service}-vpc-g${VPC_GENERATION}`;
const vpcId = Fn.importValue(`${vpcStackId}:VpcId`);
const subnetAzs = R.times(R.identity, vpcSubnetCount).map((index) =>
  Fn.importValue(`${vpcStackId}:PublicNetAvailabilityZone${index}`),
);
const publicSubnetIds = R.times(R.identity, vpcSubnetCount).map((index) =>
  Fn.importValue(`${vpcStackId}:PublicSubnetId${index}`),
);
const websocketAPIID = Fn.importValue(`${service}:${stage}:WebsocketApiId`);
const connectionsTableARN = Fn.importValue(
  `${service}:${stage}:ConnectionsTableArn`,
);
const casualMatchEntriesTableARN = Fn.importValue(
  `${service}:${stage}:CasualMatchEntriesTableArn`,
);
const battlesTableARN = Fn.importValue(`${service}:${stage}:BattlesTableArn`);

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
  matchMakeImageUri,
});
