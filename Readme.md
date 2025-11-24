# Gブレイバーバースト ネットワーク

本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールである。
リポジトリは[npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[turborepo](https://turbo.build/repo/docs/handbook)
を用いたモノレポ構造となっている。
特に断りがない限り、本書のコマンド例のカレントディレクトリは`本リポジトリをcloneした場所の直下`であるとする。

## 必須ソフト一覧

- aws cli(2.3.4以上)
- node.js(v18.16.0以上)
- npm(9.5.1以上)
- npx(9.5.1以上)
- Docker(20.10.8以上)

## 必須アカウント一覧

- [AWS](https://aws.amazon.com/jp/?nc2=h_lg)
- [Docker Hub](https://hub.docker.com/)
- [auth0](https://auth0.com/)
- [serverless dashboard](https://www.serverless.com/dashboard)

## 事前作業

本セクションではすべての環境で必要な事前作業を述べる。

### 1. VPC作成

[ここ](./packages/aws-vpc/README.md#deploy-command)を参考に、VPCを作成する。

### 2. マッチメイク用ECRリポジトリ作成

AWSでマッチメイク用ECRリポジトリを作成する。

### 3. Docker Hubアクセストークン発行

[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参考に、Docker Hubのアクセストークンを発行する。

### 4. API GatewayがCloud Watch Logsに書き込むためのIAM Roleを作成

以下を参考に、API GatewayがCloud Watch Logsに書き込むためのIAM Roleを作成する。
Role名は「serverlessApiGatewayCloudWatchRole」とすること。

https://dev.classmethod.jp/articles/tsnote-apigw-what-to-do-when-cloudwatch-logs-role-arn-must-be-set-in-account-settings-to-enable-logging-occurs-with-api-gateway/

### 5. Cognitoユーザープールの作成

Cognitoのユーザープールを以下条件で作成する。

- CognitoユーザープールのサインインオプションはEメールに設定する **(後から変更できない)**
- Hosted UIを有効にする
  - スコープにopenid, email, profile、phone、aws.cognito.signin.user.adminを追加する
- 許可されているコールバック URL、許可されているサインアウト URLに`http://localhost:8080`、GブレイバーバーストをホストしているURLを設定する
- 検証メッセージの検証タイプを`Link`に設定する

### 6. CognitoにGooogleのソーシャルログインを追加

Google Play ConsoleでOAuth2.0クライアントIDを以下条件で追加する。
この時に生成されるクライアントIDとクライアントシークレットを控えておく。

- 承認済みのリダイレクト URIに`https://<Cognitoのドメイン>/oauth2/idpresponse`を追加する

CognitoのアイデンティティプロバイダーにGoogleを以下条件で追加する。

- 許可されたスコープは`profile email openid`を指定
- 属性マッピングは以下のように設定

| Cognito属性        | Google属性 |
| ------------------ | ---------- |
| email              | email      |
| picture            | picture    |
| preferred_username | name       |

CgonitoのホストされたUIのID プロバイダーにGoogleを追加する。

## ローカル環境構築方法

### 各種ツールの認証設定

- [ここ](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)を参考に`cdk bootstrap`を実行する
- [ここ](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考にaws cliの認証設定をする
- [ここ](https://www.serverless.com/framework/docs-guides-upgrading-v4)を参考にserverless cliの認証設定をする

### モノレポの依存パッケージ解決

```shell
pm ci
npm run build
```

### 環境変数の定義

ローカル環境に以下の環境変数を定義する。

| 環境変数名                     | 記載内容                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| SERVICE                        | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する                         |
| STAGE                          | デプロイする環境のステージ名を記入する                                                                            |
| WS_API_DOMAIN_NAME             | WebSocket APIのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある                            |
| COGNITO_USER_POOL_ID           | CognitoのユーザープールID                                                                                         |
| COGNITO_CLIENT_ID              | CognitoのクライアントID                                                                                           |
| MATCH_MAKE_ECR_REPOSITORY_NAME | [2. マッチメイク用ECRリポジトリ作成](#2-マッチメイク用ecrリポジトリ作成)で作成したマッチメイク用ECRのリポジトリ名 |
| DOCKER_IMAGE_TAG               | デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定                                               |
| DOCKER_USER                    | Docker Hubのユーザ名                                                                                              |
| DOCKER_TOKEN                   | Docker Hubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照               |
| AWS_DEFAULT_REGION             | デプロイ先のAWSリージョン                                                                                         |
| VPC_SUBNET_COUNT               | FARGATEが動作するVPCのPublicサブネット個数                                                                        |

### serverlessデプロイ

```shell
./deploy-serverless.bash
```

### serverless環境削除

```shell
./remove-serverless.bash
```

### ECRリポジトリPush

```shell
./push-match-make-container.bash
```

### バックエンド処理用ECSデプロイ

```shell
# 通常デプロイ
./deploy-backend-ecs.bash

# ホットスワップデプロイ
./deploy-backend-ecs-with-hotswap.bash
```

### バックエンド処理用ECS環境削除

```shell
./remove-backend-ecs.bash
```

## GitHub Actions CI環境構築方法

### 事前作業

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する
- AWSで「SlsCli用IAMポリシー」をアタッチしたIAMユーザーを作成し、アクセスキーIDとシークレットキーを控えておく

**SlsCli用IAMポリシー**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudformation:DescribeStackResource",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

### Secrets設定

[ここ](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)を参考にGitHub
ActionsのSecretsを設定する。
以下が設定内容である。

| シークレット名        | 値                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------- |
| SERVERLESS_ACCESS_KEY | serverless dashboardから発行したaccesskey                                               |
| AWS_ACCESS_KEY_ID     | AWS IMAユーザー アクセスキーID                                                          |
| AWS_SECRET_ACCESS_KEY | AWS IMAユーザー シークレットキー                                                        |
| NPM_TOKEN             | [npmのPersonal Access Token](https://docs.npmjs.com/creating-and-viewing-access-tokens) |

## AWS CodeBuild CD環境構築方法

### 事前作業

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する。

### AWS CodeBuild開発環境

#### AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

| 名前                                         | 種類         | 値                                                                          |
| -------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| /GbraverBurst/dev/service                    | String       | [環境変数定義の定義](#環境変数の定義) SERVICE を参照                        |
| /GbraverBurst/dev/stage                      | String       | [環境変数定義の定義](#環境変数の定義) STAGE を参照                          |
| /GbraverBurst/dev/wsApiDomainName            | String       | [環境変数定義の定義](#環境変数の定義) WS_API_DOMAIN_NAME を参照             |
| /GbraverBurst/dev/cognitoUserPoolId          | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/dev/cognitoClientId            | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/dev/matchMakeEcrRepositoryName | String       | [環境変数定義の定義](#環境変数の定義) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/dev/dockerUser                 | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_USER を参照                    |
| /GbraverBurst/dev/dockerToken                | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_TOKEN を参照                   |
| /GbraverBurst/dev/vpcSubnetCount             | String       | [環境変数定義の定義](#環境変数の定義) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/dev/serverlessAccessKey        | SecureString | serverless dashboardから発行したaccesskey                                   |

#### CodeBuild

以下のCodeBuildプロジェクトを生成する。

| 役割                                                                                         | buildspec                        | 環境                                                                                                             | webhook                                     |
| -------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| フルデプロイ（環境新規作成時に利用する想定）                                                 | buildspec.yml                    | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | なし                                        |
| serverless削除                                                                               | buildspec.sls.remove.yml         | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | なし                                        |
| バックエンドECS削除                                                                          | buildspec.backendEcs.remove.yml  | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | なし                                        |
| serverlessデプロイ（CI/CDで既存環境をアップデートする際に利用する想定）                      | buildspec.sls.yml                | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| バックエンドecsをホットスワップデプロイ（CI/CDで既存環境をアップデートする際に利用する想定） | buildspec.backendEcs.hotswap.yml | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) |
| バックエンドECS通常デプロイ                                                                  | buildspec.backendEcs.yml         | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) |                                             |

##### webhook

###### 開発環境CD用webhook

developブランチにpushされた時にCodeBuildが実行されるように、以下のwebhookを設定する。

- **コードの変更がこのレポジトリにプッシュされるたびに再構築する**
  - チェックを入れる
- **ビルドタイプ**
  - 単一ビルド
- **ウェブフックイベントフィルタグループ**
  - **フィルタグループ 1**
    - **イベントタイプ**
      - プッシュ
    - **これらの条件でビルドを開始する**
      | タイプ | パターン |
      |--------|---------|
      | HEAD_REF | ^refs/heads/develop$ |
    - **これらの条件でビルドを開始しない**
      - なし

### AWS CodeBuild本番環境

#### AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

| 名前                                          | 種類         | 値                                                                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| /GbraverBurst/prod/service                    | String       | [環境変数定義の定義](#環境変数の定義) SERVICE を参照                        |
| /GbraverBurst/prod/stage                      | String       | [環境変数定義の定義](#環境変数の定義) STAGE を参照                          |
| /GbraverBurst/prod/wsApiDomainName            | String       | [環境変数定義の定義](#環境変数の定義) WS_API_DOMAIN_NAME を参照             |
| /GbraverBurst/prod/cognitoUserPoolId          | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/prod/cognitoClientId            | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/prod/matchMakeEcrRepositoryName | String       | [環境変数定義の定義](#環境変数の定義) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/prod/dockerUser                 | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_USER を参照                    |
| /GbraverBurst/prod/dockerToken                | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_TOKEN を参照                   |
| /GbraverBurst/prod/vpcSubnetCount             | String       | [環境変数定義の定義](#環境変数の定義) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/prod/serverlessAccessKey        | SecureString | serverless dashboardから発行したaccesskey                                   |

#### Code Build

以下のCode Buildプロジェクトを生成する。

| 役割                | buildspec                            | 環境                                                                                                             | 　webhook                                   |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| デプロイ            | buildspec.prod.yml                   | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | [本番環境CD用webhook](#本番環境cd用webhook) |
| serverless削除      | buildspec.sls.remove.prod.yml        | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | なし                                        |
| バックエンドECS削除 | buildspec.backendEcs.remove.prod.yml | [aws/codebuild/standard:7.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) | なし                                        |

##### webhook

###### 本番環境CD用webhook

masterブランチにpushされた時にCodeBuildが実行されるように、以下のwebhookを設定する。

- **コードの変更がこのレポジトリにプッシュされるたびに再構築する**
  - チェックを入れる
- **ビルドタイプ**
  - 単一ビルド
- **ウェブフックイベントフィルタグループ**
  - **フィルタグループ 1**
    - **イベントタイプ**
      - プッシュ
    - **これらの条件でビルドを開始する**
      | タイプ | パターン |
      |--------|---------|
      | HEAD_REF | ^refs/heads/master$ |
    - **これらの条件でビルドを開始しない**
      - なし

## パッケージ公開

```shell
# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version
npm install

npm run build
npx changeset publish
```

## その他コマンド

```shell
# package.jsonフォーマット
# 本コマンドの実行にはfixpackが必要
# https://www.npmjs.com/package/fixpack
fixpack
```

## License

MIT
