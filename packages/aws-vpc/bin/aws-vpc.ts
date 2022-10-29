#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { AwsVpcStack } from "../lib/aws-vpc-stack";
import * as dotenv from "dotenv";

dotenv.config();

const service = process.env.SERVICE ?? "";
const cidr = process.env.CIDR ?? "";
const stackID = `${service}-vpc`;

const app = new App();
new AwsVpcStack(app, stackID, { service, cidr });
