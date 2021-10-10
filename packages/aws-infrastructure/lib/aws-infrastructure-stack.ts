import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as iam from '@aws-cdk/aws-iam';

export class AwsInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stage = new cdk.CfnParameter(this, 'stage', {
      type: 'String',
      description: 'serverless stage name',
    }).valueAsString;
    const websocketAPIID = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:WebsoketApiId`);
    const connectionsTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:ConnectionsTableArn`);
    const casualMatchEntriesTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:CasualMatchEntriesTableArn`);
    const battlesTableARN = cdk.Fn.importValue(`gbraver-burst-serverless:${stage}:BattlesTableArn`);

    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 1,
    });

    const matchMakeRepository = ecr.Repository.fromRepositoryName(this, "repo", "gbraver-burst-match-make");
    const matchMakePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: [
            connectionsTableARN,
            casualMatchEntriesTableARN,
            battlesTableARN
          ],
          actions: [
            'dynamodb:PutItem',
            'dynamodb:GetItem',
            'dynamodb:DeleteItem',
            'dynamodb:Scan',
            'dynamodb:BatchWrite*',
          ],
        }),
        new iam.PolicyStatement({
          resources: ['arn:aws:execute-api:*:*:**/@connections/*'],
          actions: ['execute-api:ManageConnections'],
        }),
      ],
    });
    const matchMakeServiceTaskRole = new iam.Role(this, 'match-make-service-task-role', {
      roleName: 'ecs-service-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: {matchMakePolicy}
    });
    const matchMakeTaskDefinition = new ecs.TaskDefinition(this, "taskdef", {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: "256",
      memoryMiB: "512",
      taskRole: matchMakeServiceTaskRole
    });
    const matchMakeLogging = new ecs.AwsLogDriver({
      streamPrefix: "gbraver-burst-match-make",
    });
    matchMakeTaskDefinition.addContainer(`match-make-container`, {
      image: ecs.ContainerImage.fromAsset('../serverless', {
        file: 'matchMake.Dockerfile'
      }),
      environment: {
        STAGE: stage,
        WEBSOCKET_API_ID: websocketAPIID,
      },
      logging: matchMakeLogging,
    });
    const cluster = new ecs.Cluster(this, "cluster", { vpc });
    const matchMakeService = new ecs.FargateService(this, "service", {
      cluster,
      taskDefinition: matchMakeTaskDefinition
    });
  }
}