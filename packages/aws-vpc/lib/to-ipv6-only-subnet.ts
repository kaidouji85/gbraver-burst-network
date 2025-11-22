import { aws_ec2 as ec2 } from "aws-cdk-lib";

/**
 * サブネットをIPv6のみに変更する
 * @param subnet 変更対象のサブネット
 */
export const toIpV6OnlySubnet = (subnet: ec2.ISubnet): void => {
  const defaultChild = subnet.node.defaultChild;
  if (!defaultChild || !(defaultChild instanceof ec2.CfnSubnet)) {
    throw new Error("Subnet does not have a valid CfnSubnet as defaultChild");
  }

  defaultChild.ipv6Native = true;
  defaultChild.cidrBlock = undefined;
  defaultChild.enableDns64 = true;
};
