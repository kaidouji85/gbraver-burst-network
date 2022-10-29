import { Stack, StackProps } from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_ecr as ecr,
  aws_ecs as ecs,
  aws_iam as iam,
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
  /** 本ECSを起動するパブリックサブネットのアベイラビリティゾーン */
  publicSubnetAvailabilityZone: string;
  /** 本ECSを起動するパブリックサブネットのID */
  publicSubnetId: string;
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
  /** 本スタックを実行するたびに発行するUUID */
  uuid: string;
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
      availabilityZones: [props.publicSubnetAvailabilityZone],
      publicSubnetIds: [props.publicSubnetId],
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
    // コンテナイメージを強制的に更新するために、
    // タスク定義にユニークIDを含めてCloudFormation上は新規タスク定義に見えるようにしている
    matchMakeTaskDefinition.addContainer(`match-make-container-${props.uuid}`, {
      image: ecs.ContainerImage.fromEcrRepository(
        matchMakeRepository,
        props.stage
      ),
      environment: {
        SERVICE: props.service,
        STAGE: props.stage,
        WEBSOCKET_API_ID: props.websocketAPIID,
      },
      logging: matchMakeLogging,
    });
    const cluster = new ecs.Cluster(this, "backend-ecs-cluster", { vpc });
    new ecs.FargateService(this, "service", {
      cluster,
      taskDefinition: matchMakeTaskDefinition,
      assignPublicIp: true,
    });
  }
}
