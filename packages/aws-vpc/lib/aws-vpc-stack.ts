import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SubnetType } from "aws-cdk-lib/aws-ec2";

/** VPCスタックプロパティ */
interface VPCProps extends StackProps {
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
   * @param stackID スタックのID
   * @param props CDKプロパティ
   */
  constructor(scope: Construct, stackID: string, props: VPCProps) {
    super(scope, stackID, props);
    const vpc = new ec2.Vpc(this, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      maxAzs: 3,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });
    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      exportName: `${stackID}:VpcId`,
    });

    vpc.publicSubnets.forEach((subnets, index) => {
      new CfnOutput(this, `PublicNetAvailabilityZone${index}`, {
        value: subnets.availabilityZone,
        exportName: `${stackID}:PublicNetAvailabilityZone${index}`,
      });
      new CfnOutput(this, `PublicSubnetId${index}`, {
        value: subnets.subnetId,
        exportName: `${stackID}:PublicSubnetId${index}`,
      });
    });
  }
}
