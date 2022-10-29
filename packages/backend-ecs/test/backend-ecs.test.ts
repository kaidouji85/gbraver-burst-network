import {App} from 'aws-cdk-lib';
import {Template} from "aws-cdk-lib/assertions";

import {BackendEcsStack} from '../lib/backend-ecs-stack';

test('バックエンドECSスタックがスナップショットと一致している', () => {
    const app = new App();
    const stack = new BackendEcsStack(app, 'MyTestStack', {
      service: 'gbraver-buesr-sls-dev',
      stage: 'v1-5-1',
      vpcId: 'MyVpcId',
      publicSubnetId: 'MyPrivateSubnetId',
      publicSubnetAvailabilityZone: 'MyPrivateNetAvailabilityZone',
      websocketAPIID: 'MyWebsocketAPIID',
      connectionsTableARN: 'MyConnectionsTableARN',
      casualMatchEntriesTableARN: 'MyCasualMatchEntriesTableARN',
      battlesTableARN: 'MyBattlesTableARN',
      matchMakeEcrRepositoryName: 'MyMatchMakeRepositoryName',
      uuid: 'test-uuid'
    });
    const template = Template.fromStack(stack).toJSON();
    expect(template).toMatchSnapshot();
});
