#!/usr/bin/env node
import "source-map-support/register";

import { App } from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { AwsVpcStack } from "../lib/aws-vpc-stack";

/**
 * VCP世代番号、大きい程新しい
 * VPCはめったに更新されないため、backend-app、backend-ecsの世代管理番号であるSTAGEを使わない
 */
const generation = 2;

dotenv.config();
const service = process.env.SERVICE ?? "";
const cidr = process.env.CIDR ?? "";
const maxAzs = process.env.MAX_AZS ?? "";
const parsedMaxAzs = Number.isInteger(maxAzs) ? Number.parseInt(maxAzs) : 1;
const stackID = `${service}-vpc-g${generation}`;
const app = new App();
new AwsVpcStack(app, stackID, { cidr, maxAzs: parsedMaxAzs });
