import {Template} from "aws-cdk-lib/assertions";
import {App} from 'aws-cdk-lib';
import {AwsVpcStack} from '../lib/aws-vpc-stack';

test('VPCスタックがスナップショットと一致している', () => {
    const app = new App();
    const stack = new AwsVpcStack(app, 'MyTestStack', {
      service: 'gbraver-buesr-sls-dev',
      cidr: '172.16.0.0/16'
    });
    const template = Template.fromStack(stack).toJSON();
    expect(template).toMatchSnapshot();
});
