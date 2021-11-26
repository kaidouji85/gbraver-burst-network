#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {AwsVpcStack} from '../lib/aws-vpc-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const service = process.env.SERVICE ?? '';
const stackID = `${service}-vpc`;

const app = new cdk.App();
new AwsVpcStack(app, stackID, {service});
