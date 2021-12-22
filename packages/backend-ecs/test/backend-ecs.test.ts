import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert';
import {App} from 'aws-cdk-lib';

import {BackendEcsStack} from '../lib/backend-ecs-stack';

// TODO テストに失敗しないようにexpectCDKを正しく定義する
test('Empty Stack', () => {
    const app = new App();
    // WHEN
    const stack = new BackendEcsStack(app, 'MyTestStack', {
      service: 'gbraver-burst-serverless',
      stage: 'dev',
      vpcId: 'MyVpcId',
      publicSubnetId: 'MyPrivateSubnetId',
      publicSubnetAvailabilityZone: 'MyPrivateNetAvailabilityZone',
      websocketAPIID: 'MyWebsocketAPIID',
      connectionsTableARN: 'MyConnectionsTableARN',
      casualMatchEntriesTableARN: 'MyCasualMatchEntriesTableARN',
      battlesTableARN: 'MyBattlesTableARN',
      matchMakeEcrRepositoryName: 'MyMatchMakeRepositoryName'
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
