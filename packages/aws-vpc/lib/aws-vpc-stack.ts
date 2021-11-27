import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";

/** VPCスタックプロパティ */
interface VPCProps extends cdk.StackProps {
  /** サービス名 */
  service: string,
  /** VPC CIDR */
  cidr: string
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
      cidr: props.cidr,
      maxAzs: 1,
      natGateways: 0
    });
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      exportName: `${props.service}:VpcId`
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
