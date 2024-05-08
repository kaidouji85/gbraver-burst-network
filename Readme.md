# Gブレイバーバースト ネットワーク

本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールです。
リポジトリは[npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[turborepo](https://turbo.build/repo/docs/handbook)を用いたモノレポ構造となっています。

## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```本リポジトリをcloneした場所の直下```であるとします。

<a id="pre-required"></a>
## 前提条件

<a id="pre-required-soft"></a>
### 必須ソフト
ローカル環境に以下ソフトウェアをインストールしてください。
* aws cli(2.3.4以上)
* node.js(v18.16.0以上)
* npm(9.5.1以上)
* npx(9.5.1以上)
* Docker(20.10.8以上)

<a id="repository-setup"></a>
### 内部パッケージの依存関係解決
内部パッケージの依存関係を解決するために、以下コマンドを実行してください。

```shell
pm ci
npm run build
```

<a id="pre-required-account"></a>
### 必須アカウント
以下サービスのアカウント登録をしてください。
* AWS
* Dockerhub
* auth0

<a id="pre-required-task"></a>
### 事前作業
以下の事前作業を完了させてください。
1. [aws cli 認証設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)
2. [cdk bootstrap](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)が完了している
3. [VPCの作成](./packages/aws-vpc/README.md#deploy-command)
4. マッチメイク用ECRリポジトリの作成
5. [dockerhubアクセストークン発行](https://docs.docker.com/docker-hub/access-tokens/)
6. 以下設定で[auth0 API 作成](https://auth0.com/docs/get-started/auth0-overview/set-up-apis)
    * Name -> 任意
    * Identifier -> 任意
    * Signing Algorithm -> RS256
7. 以下設定で[auth0 Application 作成](https://auth0.com/docs/get-started/create-apps)
    * Name -> 任意
    * Choose an application type　-> Single Page Web Applications
    * Allowed Callback URLs -> フロントエンド公開URL
    * Allowed Logout URLs -> フロントエンド公開URL
    * Allowed Web Origins -> フロントエンド公開URL
8. 以下設定でauth0 Application 作成
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
9. 以下設定でテスト環境のAWS Secret Managerを作成する
  * シークレットのタイプ -> その他のシークレットタイプ
  * キー/値のペア
    * auth0UserManagementAppClientSecret
    * [事前作業](#pre-required-task) 8. で作成したAuth0 Applicationのclient secretを記載する 
  * 上記以外の項目は任意

## 環境構築方法
### ローカル環境からデプロイする

<a id="env-config"></a>
#### 環境変数の定義
ローカル環境に以下の環境変数を定義します。

| 環境変数名                                   | 記載内容                                                                                                                  |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| SERVICE                                 | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する                                                    |
| STAGE                                   | デプロイする環境のステージ名を記入する                                                                                                   |
| ALLOW_ORIGIN                            | RestAPIサーバのAccess-Control-Allow-Origin、本APIを利用するサイトのURLを記載する                                                          |
| TEST_ALLOW_ORIGIN                       | RestAPIサーバのAccess-Control-Allow-Origin、本APIにテスト目的で接続するサイトのURLを記載する                                                    |
| AUTH0_DOMAIN                            | auth0のドメインを記載                                                                                                         |
| AUTH0_JWKS_URL                          | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| AUTH0_AUDIENCE                          | [事前作業](#pre-required-task) 6. で作成したAuth0 APIのIdentifierを記載する                                                          |
| AUTH0_USER_MANAGEMENT_DOMAIN            | auth0のドメインを記載（カスタムドメインは利用不可、本来のドメイン名を指定）                                                                              |
| AUTH0_USER_MANAGEMENT_APP_CLIENT_ID     | [事前作業](#pre-required-task) 8. で作成したAuth0 Applicationのclient idを記載する                                                   |
| AUTH0_SECRET_NAME | [事前作業](#pre-required-task) 9. で作成したAuth0用Secret Managerのシークレット名を記載する                                               |
| MATCH_MAKE_ECR_REPOSITORY_NAME          | [事前作業](#pre-required-task) 3. で作成したマッチメイク用ECRのリポジトリ名                                                                  |
| DOCKER_IMAGE_TAG                        | デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定                                                                                |
| DOCKER_USER                             | dockerhubのユーザ名                                                                                                        |
| DOCKER_TOKEN                            | dockerhubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照                                      |
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

### AWS CodeBuild/CodePipelineでCI/CDする

#### ビルド環境について
以下がGブレイバーバーストで利用するビルド環境です。

| #      | ビルド環境               | 説明 |
|--------|---------------------|------|
| BLD-01 | ubuntu/standard/7.0 | AWS管理イメージ、詳細は[ここ](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/7.0) を参照 |

#### 開発環境でのCI/CD

##### AWS Secret Managerを設定
AwS Secret Managerに以下をセットします。

| シークレット名 | 設定内容 |
| ------------- | -------- |
| /GbraverBurst/dev/auth0 | [事前作業](#pre-required-task)9.を参照 |

##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

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

##### CodeBuild
以下のCodeBuildプロジェクトを生成します

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
| /GbraverBurst/prod/auth0 | [事前作業](#pre-required-task)9.を参照 

##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

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

##### Code Build
以下のCode Buildプロジェクトを生成します

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