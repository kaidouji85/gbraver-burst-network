import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsVpc from '../lib/aws-vpc-stack';

// TODO テストに失敗しないようにexpectCDKを正しく定義する
test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AwsVpc.AwsVpcStack(app, 'MyTestStack', {
      service: 'my-service',
      cidr: '172.16.0.0/16'
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
