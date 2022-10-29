import { Construct } from "constructs";
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

/** VPCスタックプロパティ */
interface VPCProps extends StackProps {
  /** サービス名 */
  service: string;
  /** VPC CIDR */
  cidr: string;
}

/** VPC スタック */
export class AwsVpcStack extends Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param id スタックのID
   * @param props CDKプロパティ
   */
  constructor(scope: Construct, id: string, props: VPCProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, "vpc", {
      cidr: props.cidr,
      maxAzs: 1,
      natGateways: 0,
    });
    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      exportName: `${props.service}:VpcId`,
    });
    const publicSubnet = vpc.publicSubnets[0];
    new CfnOutput(this, "PulicNetAvailabilityZone", {
      value: publicSubnet.availabilityZone,
      exportName: `${props.service}:PulicNetAvailabilityZone`,
    });
    new CfnOutput(this, "PulicSubnetId", {
      value: publicSubnet.subnetId,
      exportName: `${props.service}:PulicSubnetId`,
    });
  }
}
