# Gブレイバーバースト ネットワーク

本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールである。
リポジトリは[npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[turborepo](https://turbo.build/repo/docs/handbook)
を用いたモノレポ構造となっている。
特に断りがない限り、本書のコマンド例のカレントディレクトリは```本リポジトリをcloneした場所の直下```であるとする。

## 必須ソフト一覧

* aws cli(2.3.4以上)
* node.js(v18.16.0以上)
* npm(9.5.1以上)
* npx(9.5.1以上)
* Docker(20.10.8以上)

## 必須アカウント一覧

* [AWS](https://aws.amazon.com/jp/?nc2=h_lg)
* [Docker Hub](https://hub.docker.com/)
* [auth0](https://auth0.com/)
* [serverless dashboard](https://www.serverless.com/dashboard)

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

* CognitoユーザープールのサインインオプションはEメールに設定する
  * 後から変更できない
* Hosted UIを有効にする
    * スコープにopenid, email, profile、phone、aws.cognito.signin.user.adminを追加する
* 許可されているコールバック URL、許可されているサインアウト URLに```http://localhost:8080```、GブレイバーバーストをホストしているURLを設定する

### 6. CognitoにGooogleのソーシャルログインを追加

Google Play ConsoleでOAuth2.0クライアントIDを以下条件で追加する。
この時に生成されるクライアントIDとクライアントシークレットを控えておく。

* 承認済みのリダイレクト URIに```https://<Cognitoのドメイン>/oauth2/idpresponse```を追加する

CognitoのアイデンティティプロバイダーにGoogleを以下条件で追加する。

* 許可されたスコープは```profile email openid```を指定
* 属性マッピングは以下のように設定

| Cognito属性          | Google属性 |
|--------------------|----------|
| email              | email    |
| picture            | picture  |
| preferred_username | name     |

CgonitoのホストされたUIのID プロバイダーにGoogleを追加する。

## 環境構築方法

### ローカル環境

#### 各種ツールの認証設定

* [ここ](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)を参考に```cdk bootstrap```を実行する
* [ここ](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考にaws cliの認証設定をする
* [ここ](https://www.serverless.com/framework/docs-guides-upgrading-v4)を参考にserverless cliの認証設定をする

#### モノレポの依存パッケージ解決

```shell
pm ci
npm run build
```

<a id="env-config"></a>

#### 環境変数の定義

ローカル環境に以下の環境変数を定義する。

| 環境変数名                          | 記載内容                                                                              |
|--------------------------------|-----------------------------------------------------------------------------------|
| SERVICE                        | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する                |
| STAGE                          | デプロイする環境のステージ名を記入する                                                               |
| ALLOW_ORIGIN                   | RestAPIサーバのAccess-Control-Allow-Origin、本APIを利用するサイトのURLを記載する                      |
| TEST_ALLOW_ORIGIN              | RestAPIサーバのAccess-Control-Allow-Origin、本APIにテスト目的で接続するサイトのURLを記載する                |
| COGNITO_USER_POOL_ID           | CognitoのユーザープールID                                                                 |
| COGNITO_CLIENT_ID              | CognitoのクライアントID                                                                  |
| MATCH_MAKE_ECR_REPOSITORY_NAME | [2. マッチメイク用ECRリポジトリ作成](#2-マッチメイク用ecrリポジトリ作成)で作成したマッチメイク用ECRのリポジトリ名                |
| DOCKER_IMAGE_TAG               | デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定                                            |
| DOCKER_USER                    | Docker Hubのユーザ名                                                                   |
| DOCKER_TOKEN                   | Docker Hubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照 |
| AWS_DEFAULT_REGION             | デプロイ先のAWSリージョン                                                                    |
| VPC_SUBNET_COUNT               | FARGATEが動作するVPCのPublicサブネット個数                                                     |                                                                                                                      |

#### serverlessデプロイ

```shell
./deploy-serverless.bash
```

#### serverless環境削除

```shell
./remove-serverless.bash
```

#### ECRリポジトリPush

```shell
./push-match-make-container.bash
```

#### バックエンド処理用ECSデプロイ

```shell
# 通常デプロイ
./deploy-backend-ecs.bash

# ホットスワップデプロイ
./deploy-backend-ecs-with-hotswap.bash
```

#### バックエンド処理用ECS環境削除

```shell
./remove-backend-ecs.bash
```

### GitHub ActionsでCIする

#### 事前作業

* serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する
* AWSで作業用IAMユーザーのアクセスキーを生成する
    * 上記IAMユーザーには権限設定は不要
    * CIでAWSにアクセスする作業は行っておらず、serverless cliのAWS認証にのみアクセスキーを利用しているため

#### Secrets設定

[ここ](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)を参考にGitHub
ActionsのSecretsを設定する。
以下が設定内容である。

| シークレット名               | 値                                   |
|-----------------------|-------------------------------------|
| SERVERLESS_ACCESS_KEY | serverless dashboardから発行したaccesskey |
| AWS_ACCESS_KEY_ID     | AWS IMAユーザー アクセスキーID                |
| AWS_SECRET_ACCESS_KEY | AWS IMAユーザー シークレットキー                |

### AWS CodeBuild/CodePipelineでCDする

#### ビルド環境について

以下がGブレイバーバーストで利用するビルド環境である。

| #      | ビルド環境               | 説明                                                                                                        |
|--------|---------------------|-----------------------------------------------------------------------------------------------------------|
| BLD-01 | ubuntu/standard/7.0 | AWS管理イメージ、詳細は[ここ](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) を参照 |

#### 事前作業

* serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する。

#### 開発環境でのCI/CD

##### AWS Parameter Storeを設定

AWS Parameter Storeに以下の値をセットする。

| 名前                                           | 種類           | 値                                                           |
|----------------------------------------------|--------------|-------------------------------------------------------------|
| /GbraverBurst/dev/service                    | String       | [環境変数定義の定義](#env-config) SERVICE を参照                        |
| /GbraverBurst/dev/stage                      | String       | [環境変数定義の定義](#env-config) STAGE を参照                          |
| /GbraverBurst/dev/allowOrigin                | String       | [環境変数定義の定義](#env-config) ALLOW_ORIGIN を参照                   |
| /GbraverBurst/dev/testAllowOrigin            | String       | [環境変数定義の定義](#env-config) TEST_ALLOW_ORIGIN を参照              |
| /GbraverBurst/dev/cognitoUserPoolId          | String       | [環境変数定義の定義](#env-config) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/dev/cognitoClientId            | String       | [環境変数定義の定義](#env-config) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/dev/matchMakeEcrRepositoryName | String       | [環境変数定義の定義](#env-config) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/dev/dockerUser                 | SecureString | [環境変数定義の定義](#env-config) DOCKER_USER を参照                    |
| /GbraverBurst/dev/dockerToken                | SecureString | [環境変数定義の定義](#env-config) DOCKER_TOKEN を参照                   |
| /GbraverBurst/dev/vpcSubnetCount             | String       | [環境変数定義の定義](#env-config) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/dev/serverlessAccessKey        | SecureString | serverless dashboardから発行したaccesskey                         |

##### CodeBuild

以下のCodeBuildプロジェクトを生成する。

| #        | 概要                                                 | BuildSpec                       | ビルド環境  |
|----------|----------------------------------------------------|---------------------------------|--------|
| DEVCB-01 | フルデプロイ（環境新規作成時に利用する想定）                             | buildspec.yml                   | BLD-01 |
| DEVCB-02 | serverless削除                                       | buildspec.sls.remove.yml        | BLD-01 |
| DEVCB-03 | バックエンドECS削除                                        | buildspec.backendEcs.remove.yml | BLD-01 |
| DEVCB-04 | serverlessデプロイ（CI/CDで既存環境をアップデートする際に利用する想定）        | buildspec.sls.yml               | BLD-01 |
| DEVCB-05 | バックエンドecsをホットスワップデプロイ（CI/CDで既存環境をアップデートする際に利用する想定） | buildspec.backendEcs.yml        | BLD-01 |

##### CodePipeline

DEVCB-04、DEVCB-05を並列実行するプロジェクトを作成する。
ただし、事前にDEVCB-01で環境を作成すること。

#### 本番環境でのCI/CD

##### AWS Parameter Storeを設定

AWS Parameter Storeに以下の値をセットする。

| 名前                                            | 種類           | 値                                                           |
|-----------------------------------------------|--------------|-------------------------------------------------------------|
| /GbraverBurst/prod/service                    | String       | [環境変数定義の定義](#env-config) SERVICE を参照                        |
| /GbraverBurst/prod/stage                      | String       | [環境変数定義の定義](#env-config) STAGE を参照                          |
| /GbraverBurst/prod/allowOrigin                | String       | [環境変数定義の定義](#env-config) ALLOW_ORIGIN を参照                   |
| /GbraverBurst/prod/testAllowOrigin            | String       | [環境変数定義の定義](#env-config) TEST_ALLOW_ORIGIN を参照              |
| /GbraverBurst/prod/cognitoUserPoolId          | String       | [環境変数定義の定義](#env-config) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/prod/cognitoClientId            | String       | [環境変数定義の定義](#env-config) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/prod/matchMakeEcrRepositoryName | String       | [環境変数定義の定義](#env-config) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/prod/dockerUser                 | SecureString | [環境変数定義の定義](#env-config) DOCKER_USER を参照                    |
| /GbraverBurst/prod/dockerToken                | SecureString | [環境変数定義の定義](#env-config) DOCKER_TOKEN を参照                   |
| /GbraverBurst/prod/vpcSubnetCount             | String       | [環境変数定義の定義](#env-config) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/prod/serverlessAccessKey        | SecureString | serverless dashboardから発行したaccesskey                         |

##### Code Build

以下のCode Buildプロジェクトを生成する。

| #        | 概要           | BuildSpec                            | ビルド環境  |
|----------|--------------|--------------------------------------|--------|
| PROCB-01 | デプロイ         | buildspec.prod.yml                   | BLD-01 |
| PROCB-02 | serverless削除 | buildspec.sls.remove.prod.yml        | BLD-01 |
| PROCB-03 | バックエンドECS削除  | buildspec.backendEcs.remove.prod.yml | BLD-01 |

## パッケージ公開

```shell
# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version

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

#License
MIT
