import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

/** Cloud Formation Output プレフィックス */
const CFN_OUTPUT_PREFIX = 'VpcV2';

/** VPCスタックプロパティ */
interface VPCProps extends StackProps {
  /** サービス名 */
  service: string;
  /** VPC CIDR */
  cidr: string;
  /** AZ数 */
  maxAzs: number;
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
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      maxAzs: props.maxAzs,
      natGateways: 0,
    });
    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      exportName: `${props.service}:${CFN_OUTPUT_PREFIX}:VpcId`,
    });

    vpc.publicSubnets.forEach((subnets, index) => {
      new CfnOutput(this, `PublicNetAvailabilityZone${index}`, {
        value: subnets.availabilityZone,
        exportName: `${props.service}:${CFN_OUTPUT_PREFIX}:PublicNetAvailabilityZone${index}`,
      });
      new CfnOutput(this, `PublicSubnetId${index}`, {
        value: subnets.subnetId,
        exportName: `${props.service}:${CFN_OUTPUT_PREFIX}:PublicSubnetId${index}`,
      });
    });
  }
}
