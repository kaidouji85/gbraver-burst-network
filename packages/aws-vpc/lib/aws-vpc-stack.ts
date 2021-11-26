import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";

/** VPC スタック */
export class AwsVpcStack extends cdk.Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param id スタックのID
   * @param props CDKプロパティ
   */
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 1,
    });
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      exportName: `${id}:VpcId`
    });
    const privateSubnet = vpc.privateSubnets[0];
    new cdk.CfnOutput(this, 'PrivateNetAvailabilityZone', {
      value: privateSubnet.availabilityZone,
      exportName: `${id}:PrivateNetAvailabilityZone`
    });
    new cdk.CfnOutput(this, 'PrivateSubnetId', {
      value: privateSubnet.subnetId,
      exportName: `${id}:PrivateSubnetId`
    });
    const publicSubnet = vpc.publicSubnets[0];
    new cdk.CfnOutput(this, 'PulicNetAvailabilityZone', {
      value: publicSubnet.availabilityZone,
      exportName: `${id}:PulicNetAvailabilityZone`
    });
    new cdk.CfnOutput(this, 'PulicSubnetId', {
      value: publicSubnet.subnetId,
      exportName: `${id}:PulicSubnetId`
    });
  }
}
