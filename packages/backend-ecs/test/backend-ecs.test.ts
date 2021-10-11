import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import {BackendEcsStack} from '../lib/backend-ecs-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BackendEcsStack(app, 'MyTestStack', {
      stage: 'dev',
      vpcId: 'MyVpcId',
      privateSubnetId: 'MyPrivateSubnetId',
      privateNetAvailabilityZone: 'MyPrivateNetAvailabilityZone',
      websocketAPIID: 'MyWebsocketAPIID',
      connectionsTableARN: 'MyConnectionsTableARN',
      casualMatchEntriesTableARN: 'MyCasualMatchEntriesTableARN',
      battlesTableARN: 'MyBattlesTableARN',
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
