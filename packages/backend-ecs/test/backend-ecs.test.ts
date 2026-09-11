import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { BackendEcsStack } from "../lib/backend-ecs-stack";

test("バックエンドECSスタックがスナップショットと一致している", () => {
  const app = new App();
  const stack = new BackendEcsStack(app, "MyTestStack", {
    service: "gbraver-buesr-sls-dev",
    stage: "v1-5-1",
    vpcId: "vpc-0123456789abcdef0",
    subnetAzs: ["az-a", "az-b", "az-c"],
    publicSubnetIds: [
      "subnet-0123456789abcdef0",
      "subnet-0123456789abcdef1",
      "subnet-0123456789abcdef2",
    ],
    websocketAPIID: "MyWebsocketAPIID",
    connectionsTableARN:
      "arn:aws:dynamodb:ap-northeast-1:123456789012:table/MyConnectionsTable",
    casualMatchEntriesTableARN:
      "arn:aws:dynamodb:ap-northeast-1:123456789012:table/MyCasualMatchEntriesTable",
    battlesTableARN:
      "arn:aws:dynamodb:ap-northeast-1:123456789012:table/MyBattlesTable",
    matchMakeEcrRepositoryName: "MyMatchMakeRepositoryName",
    dockerImageTag: "MyDockerImageTag",
  });
  const template = Template.fromStack(stack).toJSON();
  expect(template).toMatchSnapshot();
});
