import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as iam from '@aws-cdk/aws-iam';

/** バックエンドECSスタックのプロパティ */
interface BackendEcsProps extends cdk.StackProps {
  /** @gbraver-burst-network/serverless のステージ名 */
  stage: string,
  /** 本ECSを起動するVPCのID */
  vpcId: string,
  /** 本ECSを起動するサブネットのアベイラビリティゾーン */
  privateNetAvailabilityZone: string,
  /** 本ECSを起動するプライベートサブネットのID */
  privateSubnetId: string,
  /** Websocket API GatewayのID */
  websocketAPIID: string,
  /** DynamoDB connections テーブルのARN */
  connectionsTableARN: string,
  /** DynamoDB casualMatchEntries テーブルのARN */
  casualMatchEntriesTableARN: string,
  /** DynamoDB battles テーブルのARN */
  battlesTableARN: string,
}

/** バックエンドECS スタック */
export class BackendEcsStack extends cdk.Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param id スタックID
   * @param props スタックのプロパティ
   */
  constructor(scope: cdk.Construct, id: string, props: BackendEcsProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'backend-ecs-vpc', {
      vpcId: props.vpcId,
      availabilityZones: [props.privateNetAvailabilityZone],
      privateSubnetIds: [props.privateSubnetId]
    });

    const matchMakePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: [
            props.connectionsTableARN,
            props.casualMatchEntriesTableARN,
            props.battlesTableARN
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
        STAGE: props.stage,
        WEBSOCKET_API_ID: props.websocketAPIID,
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