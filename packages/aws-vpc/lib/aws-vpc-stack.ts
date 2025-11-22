import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { toIpV6OnlySubnet } from "./to-ipv6-only-subnet";

/** VPCスタックプロパティ */
interface VPCProps extends StackProps {
  /** VPC CIDR */
  cidr: string;
  /** AZ数 */
  maxAzs: number;
  /** サブネットのCIDRマスク */
  subnetCidrMask: number;
  /** サブネットをIPv6のみにするか */
  ipv6OnlySubnets?: boolean;
}

/** VPC スタック */
export class AwsVpcStack extends Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param stackID スタックのID
   * @param props CDKプロパティ
   */
  constructor(scope: Construct, stackID: string, props: VPCProps) {
    super(scope, stackID, props);
    const vpc = new ec2.Vpc(this, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      maxAzs: props.maxAzs,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: props.subnetCidrMask,
          name: "PublicSubnet",
          subnetType: SubnetType.PUBLIC,
        },
      ],
      ipProtocol: ec2.IpProtocol.DUAL_STACK,
    });

    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      exportName: `${stackID}:VpcId`,
    });
    new CfnOutput(this, "SubnetCount", {
      value: `${vpc.publicSubnets.length}`,
      exportName: `${stackID}:SubnetCount`,
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      toIpV6OnlySubnet(subnet);
      new CfnOutput(this, `PublicNetAvailabilityZone${index}`, {
        value: subnet.availabilityZone,
        exportName: `${stackID}:PublicNetAvailabilityZone${index}`,
      });
      new CfnOutput(this, `PublicSubnetId${index}`, {
        value: subnet.subnetId,
        exportName: `${stackID}:PublicSubnetId${index}`,
      });
    });
  }
}
