import {App} from 'aws-cdk-lib';
import {Template} from "aws-cdk-lib/assertions";

import {BackendEcsStack} from '../lib/backend-ecs-stack';

test('バックエンドECSスタックがスナップショットと一致している', () => {
    const app = new App();
    const stack = new BackendEcsStack(app, 'MyTestStack', {
      service: 'gbraver-buesr-sls-dev',
      stage: 'v1-5-1',
      vpcId: 'MyVpcId',
      subnetAzs: ['az-a', 'az-b', 'az-c'],
      publicSubnetIds: ['subnet-id-0', 'subnet-id-1', 'subnet-id-2'],
      websocketAPIID: 'MyWebsocketAPIID',
      connectionsTableARN: 'MyConnectionsTableARN',
      casualMatchEntriesTableARN: 'MyCasualMatchEntriesTableARN',
      battlesTableARN: 'MyBattlesTableARN',
      matchMakeEcrRepositoryName: 'MyMatchMakeRepositoryName',
      dockerImageTag: 'MyDockerImageTag',
      uuid: 'test-uuid'
    });
    const template = Template.fromStack(stack).toJSON();
    expect(template).toMatchSnapshot();
});
