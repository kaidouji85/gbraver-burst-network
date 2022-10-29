#!/usr/bin/env node
import "source-map-support/register";

import { App } from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { AwsVpcStack } from "../lib/aws-vpc-stack";

dotenv.config();

const service = process.env.SERVICE ?? "";
const cidr = process.env.CIDR ?? "";
const stackID = `${service}-vpc`;

const app = new App();
new AwsVpcStack(app, stackID, { service, cidr });
