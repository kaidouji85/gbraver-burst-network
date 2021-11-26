import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";

/** VPCスタックプロパティ */
interface VPCProps extends cdk.StackProps {
  /** サービス名 */
  service: string,
};

/** VPC スタック */
export class AwsVpcStack extends cdk.Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param id スタックのID
   * @param props CDKプロパティ
   */
  constructor(scope: cdk.Construct, id: string, props: VPCProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 1,
    });
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      exportName: `${props.service}:VpcId`
    });
    const privateSubnet = vpc.privateSubnets[0];
    new cdk.CfnOutput(this, 'PrivateNetAvailabilityZone', {
      value: privateSubnet.availabilityZone,
      exportName: `${props.service}:PrivateNetAvailabilityZone`
    });
    new cdk.CfnOutput(this, 'PrivateSubnetId', {
      value: privateSubnet.subnetId,
      exportName: `${props.service}:PrivateSubnetId`
    });
    const publicSubnet = vpc.publicSubnets[0];
    new cdk.CfnOutput(this, 'PulicNetAvailabilityZone', {
      value: publicSubnet.availabilityZone,
      exportName: `${props.service}:PulicNetAvailabilityZone`
    });
    new cdk.CfnOutput(this, 'PulicSubnetId', {
      value: publicSubnet.subnetId,
      exportName: `${props.service}:PulicSubnetId`
    });
  }
}
