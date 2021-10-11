#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsVpcStack } from '../lib/aws-vpc-stack';

const app = new cdk.App();
new AwsVpcStack(app, 'gbraver-burst-vpc', {});
