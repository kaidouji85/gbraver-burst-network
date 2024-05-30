# Gブレイバーバースト ネットワーク
本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールである。
リポジトリは[npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[turborepo](https://turbo.build/repo/docs/handbook)を用いたモノレポ構造となっている。
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

### 4. auth0 API作成
[ここ](https://auth0.com/docs/get-started/auth0-overview/set-up-apis)を参考に、auth0 APIを作成する。
作成条件は、以下の通り。
  * Name -> 任意
  * Identifier -> 任意
  * Signing Algorithm -> RS256

### 5. 通常機能用auth0 Application作成
[ここ](https://auth0.com/docs/get-started/create-apps)を参考に、通常機能用auth0のauth0 Applicationを作成する。
作成条件は、以下の通り。
  * Name -> 任意
  * Choose an application type　-> Single Page Web Applications
  * Allowed Callback URLs -> フロントエンド公開URL
  * Allowed Logout URLs -> フロントエンド公開URL
  * Allowed Web Origins -> フロントエンド公開URL

### 6. 管理機能用auth0 Application作成
[ここ](https://auth0.com/docs/get-started/create-apps)を参考に、管理機能用のauth0 Applicationを作成する。
作成条件は、以下の通り。
  * Name -> 任意
  * Choose an application type -> Machine to Machine Applications
  * Select an API... -> Auth0 Management API
  * Permissions 
    * read:users
    * update:users
    * delete:users
    * update:users_app_metadata
    * delete:users_app_metadata
    * create:users_app_metadata
    * read:logs_users

### 7. AWS Secret Manager 作成
以下条件でAWS Secret Managerを作成する
  * シークレットのタイプ -> その他のシークレットタイプ
  * シークレットの値
    | シークレットキー | シークレットの値 |
    | --------------- | -------------- |
    | auth0UserManagementAppClientSecret | [6. 管理機能用auth0 Application作成](#6-管理機能用auth0-application作成)で作成したAuth0 Applicationのclient secretを記載する |

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

| 環境変数名                                   | 記載内容                                                                                                                  |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| SERVICE                                 | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する                                                    |
| STAGE                                   | デプロイする環境のステージ名を記入する                                                                                                   |
| ALLOW_ORIGIN                            | RestAPIサーバのAccess-Control-Allow-Origin、本APIを利用するサイトのURLを記載する                                                          |
| TEST_ALLOW_ORIGIN                       | RestAPIサーバのAccess-Control-Allow-Origin、本APIにテスト目的で接続するサイトのURLを記載する                                                    |
| AUTH0_DOMAIN                            | auth0のドメインを記載                                                                                                         |
| AUTH0_JWKS_URL                          | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| AUTH0_AUDIENCE                          | [4. auth0 API作成](#4-auth0-api作成) で作成したAuth0 APIのIdentifierを記載する |
| AUTH0_USER_MANAGEMENT_DOMAIN            | auth0のドメインを記載（カスタムドメインは利用不可、本来のドメイン名を指定）                                                                              |
| AUTH0_USER_MANAGEMENT_APP_CLIENT_ID     | [6. 管理機能用auth0 Application作成](#6-管理機能用auth0-application作成) で作成したAuth0 Applicationのclient idを記載する                                                   |
| AUTH0_SECRET_NAME | [7. AWS Secret Manager 作成](#7-aws-secret-manager-作成)で作成したAuth0用Secret Managerのシークレット名を記載する                                               |
| MATCH_MAKE_ECR_REPOSITORY_NAME          | [2. マッチメイク用ECRリポジトリ作成](#2-マッチメイク用ecrリポジトリ作成)で作成したマッチメイク用ECRのリポジトリ名                                                                  |
| DOCKER_IMAGE_TAG                        | デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定                                                                                |
| DOCKER_USER                             | Docker Hubのユーザ名                                                                                                        |
| DOCKER_TOKEN                            | Docker Hubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照                                      |
| AWS_DEFAULT_REGION                      | デプロイ先のAWSリージョン                                                                                                        |
| VPC_SUBNET_COUNT                        | FARGATEが動作するVPCのPublicサブネット個数                                                                                         |                                                                                                                      |

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
[ここ](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)を参考にGitHub ActionsのSecretsを設定する。
以下が設定内容である。

| シークレット名 | 値 |
| ------------- | - |
| SERVERLESS_ACCESS_KEY | serverless dashboardから発行したaccesskey |
| AWS_ACCESS_KEY_ID | AWS IMAユーザー アクセスキーID |
| AWS_SECRET_ACCESS_KEY | AWS IMAユーザー シークレットキー |

### AWS CodeBuild/CodePipelineでCDする

#### ビルド環境について
以下がGブレイバーバーストで利用するビルド環境である。

| #      | ビルド環境               | 説明 |
|--------|---------------------|------|
| BLD-01 | ubuntu/standard/7.0 | AWS管理イメージ、詳細は[ここ](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) を参照 |

#### 事前作業
* serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する。

#### 開発環境でのCI/CD

##### AWS Secret Managerを設定
AwS Secret Managerに以下をセットする。

| シークレット名 | 設定内容 |
| ------------- | -------- |
| /GbraverBurst/dev/auth0 | [AWS Secret Manager 作成](#7-aws-secret-manager-作成)を参照 |

##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットする。

| 名前                                                   | 種類           | 値                                                                    |
|------------------------------------------------------|--------------|----------------------------------------------------------------------|
| /GbraverBurst/dev/service                            | String       | [環境変数定義の定義](#env-config) SERVICE を参照                                 |
| /GbraverBurst/dev/stage                              | String       | [環境変数定義の定義](#env-config) STAGE を参照                                   |
| /GbraverBurst/dev/allowOrigin                        | String       | [環境変数定義の定義](#env-config) ALLOW_ORIGIN を参照                            |
| /GbraverBurst/dev/testAllowOrigin                    | String       | [環境変数定義の定義](#env-config) TEST_ALLOW_ORIGIN を参照                       |
| /GbraverBurst/dev/auth0Domain                        | SecureString | [環境変数定義の定義](#env-config) AUTH0_DOMAIN を参照                            |
| /GbraverBurst/dev/auth0JwksUrl                       | SecureString | [環境変数定義の定義](#env-config) AUTH0_JWKS_URL を参照                          |
| /GbraverBurst/dev/auth0Audience                      | SecureString | [環境変数定義の定義](#env-config) AUTH0_AUDIENCE を参照                          |
| /GbraverBurst/dev/auth0UserManagementDomain          | SecureString | [環境変数定義の定義](#env-config) AUTH0_USER_MANAGEMENT_DOMAIN を参照    |
| /GbraverBurst/dev/auth0UserManagementAppClientId     | SecureString | [環境変数定義の定義](#env-config) AUTH0_USER_MANAGEMENT_APP_CLIENT_ID を参照     |
| /GbraverBurst/dev/matchMakeEcrRepositoryName         | String       | [環境変数定義の定義](#env-config) MATCH_MAKE_ECR_REPOSITORY_NAME を参照          |
| /GbraverBurst/dev/dockerUser                         | SecureString | [環境変数定義の定義](#env-config) DOCKER_USER を参照                             |
| /GbraverBurst/dev/dockerToken                        | SecureString | [環境変数定義の定義](#env-config) DOCKER_TOKEN を参照                            |
| /GbraverBurst/dev/vpcSubnetCount                     | String       | [環境変数定義の定義](#env-config) VPC_SUBNET_COUNT を参照                        |
| /GbraverBurst/dev/serverlessAccessKey | SecureString | serverless dashboardから発行したaccesskey |

##### CodeBuild
以下のCodeBuildプロジェクトを生成する。

| # | 概要 | BuildSpec | ビルド環境 |
|---|--| --------- | -------- |
| DEVCB-01 | フルデプロイ（環境新規作成時に利用する想定） | buildspec.yml | BLD-01 |
| DEVCB-02 | serverless削除 | buildspec.sls.remove.yml | BLD-01 |
| DEVCB-03 | バックエンドECS削除 | buildspec.backendEcs.remove.yml | BLD-01 |
| DEVCB-04 | serverlessデプロイ（CI/CDで既存環境をアップデートする際に利用する想定）| buildspec.sls.yml | BLD-01 |
| DEVCB-05 | バックエンドecsをホットスワップデプロイ（CI/CDで既存環境をアップデートする際に利用する想定） | buildspec.backendEcs.yml | BLD-01 |

##### CodePipeline
DEVCB-04、DEVCB-05を並列実行するプロジェクトを作成する。
ただし、事前にDEVCB-01で環境を作成すること。

#### 本番環境でのCI/CD
##### AWS Secret Managerを設定
AwS Secret Managerに以下をセットします。

| シークレット名 | 設定内容 |
| ------------- | -------- |
| /GbraverBurst/prod/auth0 | [AWS Secret Manager 作成](#7-aws-secret-manager-作成)を参照 | 

##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットする。

| 名前                                                    | 種類            | 値                                                                    |
|-------------------------------------------------------|---------------|----------------------------------------------------------------------|
| /GbraverBurst/prod/service                            | String        | [環境変数定義の定義](#env-config) SERVICE を参照                                 |
| /GbraverBurst/prod/stage                              | String        | [環境変数定義の定義](#env-config) STAGE を参照                                   |
| /GbraverBurst/prod/allowOrigin                        | String        | [環境変数定義の定義](#env-config) ALLOW_ORIGIN を参照                            |
| /GbraverBurst/prod/testAllowOrigin                    | String        | [環境変数定義の定義](#env-config) TEST_ALLOW_ORIGIN を参照                       |
| /GbraverBurst/prod/auth0Domain                        | SecureString  | [環境変数定義の定義](#env-config) AUTH0_DOMAIN を参照                            |
| /GbraverBurst/prod/auth0JwksUrl                       | SecureString  | [環境変数定義の定義](#env-config) AUTH0_JWKS_URL を参照                          |
| /GbraverBurst/prod/auth0Audience                      | SecureString  | [環境変数定義の定義](#env-config) AUTH0_AUDIENCE を参照                          |
| /GbraverBurst/prod/auth0UserManagementDomain          | SecureString  | [環境変数定義の定義](#env-config) AUTH0_USER_MANAGEMENT_DOMAIN を参照     |
| /GbraverBurst/prod/auth0UserManagementAppClientId     | SecureString  | [環境変数定義の定義](#env-config) AUTH0_USER_MANAGEMENT_APP_CLIENT_ID を参照     |
| /GbraverBurst/prod/matchMakeEcrRepositoryName         | String        | [環境変数定義の定義](#env-config) MATCH_MAKE_ECR_REPOSITORY_NAME を参照          |
| /GbraverBurst/prod/dockerUser                         | SecureString  | [環境変数定義の定義](#env-config) DOCKER_USER を参照                             |
| /GbraverBurst/prod/dockerToken                        | SecureString  | [環境変数定義の定義](#env-config) DOCKER_TOKEN を参照                            |
| /GbraverBurst/prod/vpcSubnetCount                     | String        | [環境変数定義の定義](#env-config) VPC_SUBNET_COUNT を参照                        |
| /GbraverBurst/prod/serverlessAccessKey | SecureString | serverless dashboardから発行したaccesskey |

##### Code Build
以下のCode Buildプロジェクトを生成する。

| #        | 概要           | BuildSpec                           | ビルド環境 |
|----------|--------------|-------------------------------------| ------- |
| PROCB-01 | デプロイ         | buildspec.prod.yml                  | BLD-01 |
| PROCB-02 | serverless削除 | buildspec.sls.remove.prod.yml | BLD-01 |
| PROCB-03 | バックエンドECS削除  | buildspec.backendEcs.remove.prod.yml | BLD-01 |

## パッケージ公開
```shell
npm run build
npx changeset x.x.x
npx changeset publish
```

## その他コマンド
```shell
# package.jsonフォーマット
# 本コマンドの実行にはfixpackが必要
# https://www.npmjs.com/package/fixpack
fixpack
```