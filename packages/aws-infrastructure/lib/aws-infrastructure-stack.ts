import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import {SecurityGroup} from "@aws-cdk/aws-ec2";

export class AwsInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC", {
      cidr: '192.168.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ],
    });
    const securityGroup = new SecurityGroup(this, "SecurityGroup", {
      vpc: vpc,
    });
  }
}
