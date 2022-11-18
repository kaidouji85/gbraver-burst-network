#!/usr/bin/env node
import "source-map-support/register";

import { App } from "aws-cdk-lib";
import * as dotenv from "dotenv";

import { AwsVpcStack } from "../lib/aws-vpc-stack";

/**
 * VCP世代番号、大きい程新しい
 *
 * VPC構成はめったに更新せず、CDKによる既存VPCスタック更新は失敗率が高いので、
 * VPC構成を変更する際には、都度新しいVPCを生成する。
 * ただ、backend-app、backend-ecsと同じ頻度でブルーグリーンデプロイするのは無駄が多いので、
 * これらとは別に世代管理をするために、本変数が必要である。
 */
const VPC_GENERATION = 2;

dotenv.config();
const service = process.env.SERVICE ?? "";
const cidr = process.env.CIDR ?? "";
const maxAzs = process.env.MAX_AZS ?? "";
const account = process.env.CDK_DEFAULT_ACCOUNT ?? "";
const region = process.env.CDK_DEFAULT_REGION ?? "";
const parsedMaxAzs = Number.isInteger(maxAzs) ? Number.parseInt(maxAzs) : 1;
const stackID = `${service}-vpc-g${VPC_GENERATION}`;
const app = new App();
new AwsVpcStack(app, stackID, { env: {account, region}, cidr, maxAzs: parsedMaxAzs });
