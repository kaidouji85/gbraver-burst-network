import {App} from 'aws-cdk-lib';
import {Template} from "aws-cdk-lib/assertions";

import {AwsVpcStack} from '../lib/aws-vpc-stack';

test('VPCスタックがスナップショットと一致している', () => {
    const app = new App();
    const stack = new AwsVpcStack(app, 'gbraver-buesr-sls-dev-gXXXXX', {
      maxAzs: 3,
      cidr: '172.16.0.0/16',
      subnetCidrMask: 24,
    });
    const template = Template.fromStack(stack).toJSON();
    expect(template).toMatchSnapshot();
});
