import { Stack, StackProps } from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_ecr as ecr,
  aws_ecs as ecs,
  aws_iam as iam,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

/** バックエンドECSスタックのプロパティ */
interface BackendEcsProps extends StackProps {
  /** サービス名 */
  service: string;
  /** ステージ名 */
  stage: string;
  /** 本ECSを起動するVPCのID */
  vpcId: string;
  /** サブネットのAZ */
  subnetAzs: string[];
  /** PublicサブネットのID */
  publicSubnetIds: string[];
  /** Websocket API GatewayのID */
  websocketAPIID: string;
  /** DynamoDB connections テーブルのARN */
  connectionsTableARN: string;
  /** DynamoDB casualMatchEntries テーブルのARN */
  casualMatchEntriesTableARN: string;
  /** DynamoDB battles テーブルのARN */
  battlesTableARN: string;
  /** マッチメイクECRリポジトリ名 */
  matchMakeEcrRepositoryName: string;
  /** Dockerイメージのタグ */
  dockerImageTag: string;
}

/** バックエンドECS スタック */
export class BackendEcsStack extends Stack {
  /**
   * @constructor
   * @param scope スコープ
   * @param id スタックID
   * @param props スタックのプロパティ
   */
  constructor(scope: Construct, id: string, props: BackendEcsProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, "backend-ecs-vpc", {
      vpcId: props.vpcId,
      availabilityZones: props.subnetAzs,
      publicSubnetIds: props.publicSubnetIds,
    });

    const matchMakePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: [
            props.connectionsTableARN,
            props.casualMatchEntriesTableARN,
            props.battlesTableARN,
          ],
          actions: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:DeleteItem",
            "dynamodb:Scan",
            "dynamodb:BatchWrite*",
          ],
        }),
        new iam.PolicyStatement({
          resources: ["arn:aws:execute-api:*:*:**/@connections/*"],
          actions: ["execute-api:ManageConnections"],
        }),
      ],
    });
    const matchMakeServiceTaskRole = new iam.Role(
      this,
      "match-make-service-task-role",
      {
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        inlinePolicies: { matchMakePolicy },
      }
    );
    const matchMakeTaskDefinition = new ecs.TaskDefinition(
      this,
      ",match-make-taskdef",
      {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: "256",
        memoryMiB: "512",
        taskRole: matchMakeServiceTaskRole,
      }
    );
    const matchMakeLogging = new ecs.AwsLogDriver({
      streamPrefix: `${props.service}__${props.stage}__match-make`,
    });
    const matchMakeRepository = ecr.Repository.fromRepositoryName(
      this,
      "match-make-ecr",
      props.matchMakeEcrRepositoryName
    );
    matchMakeTaskDefinition.addContainer(`match-make-container`, {
      image: ecs.ContainerImage.fromEcrRepository(
        matchMakeRepository,
        props.dockerImageTag
      ),
      environment: {
        SERVICE: props.service,
        STAGE: props.stage,
        WEBSOCKET_API_ID: props.websocketAPIID,
      },
      logging: matchMakeLogging,
      healthCheck: {
        command: ["CMD-SHELL", "test -f match-make-health-check || exit 1"],
        interval: Duration.seconds(5),
        retries: 3,
      }
    });
    const cluster = new ecs.Cluster(this, "backend-ecs-cluster", { vpc });
    new ecs.FargateService(this, "service", {
      cluster,
      taskDefinition: matchMakeTaskDefinition,
      assignPublicIp: true,
    });
  }
}
