# Gブレイバーバースト ネットワーク

本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールです。
リポジトリ構造は標準的な[lerna monorepo](https://lerna.js.org) となっています。

## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```本リポジトリをcloneした場所の直下```であるとします。

<a id="pre-required"></a>
## 前提条件

<a id="pre-required-soft"></a>
### 必須ソフト
ローカル環境に以下ソフトウェアをインストールしてください。
* aws cli(2.3.4以上)
* node.js(v16.13.0以上)
* npm(8.1.0以上)
* npx(8.1.0以上)
* Docker(20.10.8以上)

<a id="repository-setup"></a>
### 内部パッケージの依存関係解決
内部パッケージの依存関係を解決するために、以下コマンドを実行してください。

```shell
pm ci
npm run bootstrap
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
2. [VPCの作成](./packages/aws-vpc/README.md#deploy-command)
3. マッチメイク用ECRリポジトリの作成
4. [dockerhubアクセストークン発行](https://docs.docker.com/docker-hub/access-tokens/)
5. 以下設定で[auth0 API 作成](https://auth0.com/docs/configure/apis)
    * Name -> 任意
    * Identifier -> 任意
    * Signing Algorithm -> RS256
6. 以下設定で[auth0 Application 作成](https://auth0.com/docs/get-started/create-apps)
    * Name -> 任意
    * Choose an application type　-> Single Page Web Applications
    * Allowed Callback URLs -> フロントエンド公開URL
    * Allowed Logout URLs -> フロントエンド公開URL
    * Allowed Web Origins -> フロントエンド公開URL
7. 以下設定でauth0 Application 作成
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
## 環境構築方法
### ローカル環境からデプロイする

#### 環境変数の定義
ローカル環境に以下の環境変数を定義します。

| 環境変数名 | 記載内容 |
| --------- | ----------- |
| SERVICE | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する |
| STAGE | デプロイする環境のステージ名を記入する |
| ALLOW_ORIGIN | RestAPIサーバのAccess-Control-Allow-Originを記載 |
| AUTH0_DOMAIN | auth0のドメインを記載 |
| AUTH0_JWKS_URL | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| AUTH0_AUDIENCE | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| AUTH0_USER_MANAGEMENT_APP_CLIENT_ID | Auth0 Management API に認証されたApplicationのclient id |
| AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET | Auth0 Management API に認証されたApplicationのclient secret |
| MATCH_MAKE_ECR_REPOSITORY_NAME | マッチメイク用ECRリポジトリ名 |
| DOCKER_USER | dockerhubのユーザ名 |
| DOCKER_TOKEN | dcoekrhudのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照|
| AWS_DEFAULT_REGION | デプロイ先のAWSリージョン |

#### serverlessデプロイ

```shell
./serverless-deploy.sh
```

#### serverless環境削除

```shell
./serverless-remove.sh
```

#### ECRリポジトリPush

```shell
./match-make-container-push.sh
```

#### バックエンド処理用ECSデプロイ

```shell
./backend-ecs-deploy.sh
```

#### バックエンド処理用ECS環境削除

```shell
./backend-ecs-remove.sh
```

### CodepipelineでCI/CDする

#### ビルド環境について
以下がGブレイバーバーストで利用するビルド環境です。

| # | ビルド環境 | 説明 |
|---|----------|------|
| BLD-01 | codebuild.node16.Dockerfile | [codebuild.node16.Dockerfile](./codebuild.node16.Dockerfile)から生成するカスタムイメージ |
| BLD-02 | ubuntu/standard/5.0 | AWS管理イメージ、詳細は[ここ](https://github.com/aws/aws-codebuild-docker-images/tree/master/ubuntu/standard/5.0) を参照 |

#### 開発環境でのCI/CD
##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

| 名前 | 種類 | 値 |
| ---- | ---- | --- |
| /GbraverBurst/dev/service | String | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する |
| /GbraverBurst/dev/stage | String | デプロイする環境のステージ名、v001、v010などを記入する |
| /GbraverBurst/dev/allowOrigin | String | RestAPIサーバのAccess-Control-Allow-Originを記載 |
| /GbraverBurst/dev/auth0Domain | SecureString | auth0のドメイン |
| /GbraverBurst/dev/auth0JwksUrl | SecureString | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| /GbraverBurst/dev/auth0Audience | SecureString | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| /GbraverBurst/dev/auth0UserManagementAppClientId | SecureString | Auth0 Management API に認証されたApplicationのclient id |
| /GbraverBurst/dev/auth0UserManagementAppClientSecret | SecureString | Auth0 Management API に認証されたApplicationのclient secret |
| /GbraverBurst/dev/dockerUser | SecureString | dockerhubのユーザID |
| /GbraverBurst/dev/dockerToken | SecureString |dcoekrhudのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照  |
| /GbraverBurst/dev/matchMakeEcrRepositoryName | String | マッチメイク用ECRリポジトリ名 |

##### Code Build
以下のCode Buildプロジェクトを生成します

| # | 概要 | BuildSpec | ビルド環境 |
|---|------| --------- | -------- |
| DEVCB-01 | テスト | backendAppTest.buildspec.yml | codebuild.node16.Dockerfile |
| DEVCB-02 | serverlessデプロイ | serverless.buildspec.yml | codebuild.node16.Dockerfile |
| DEVCB-03 | マッチメイクEcrPush| matchMakeContainer.buildspec.yml | ubuntu/standard/5.0 |
| DEVCB-04 | バックエンドECSデプロイ| backendEcs.buildspec.yml | codebuild.node16.Dockerfile |

#### Code Pipeline

以下構成のCodePipeLineを作成します。
処理順番が同じものは、並列実行の設定をしてください。

| 処理順番 | CodeBuild |
| ------- | ---------- |
| 001 | DEVCB-01.テスト |
| 002 | DEVCB-02.serverlessデプロイ |
| 002 | DEVCB-03.マッチメイクEcrPush |
| 003 | DEVCB-04.バックエンドECSデプロイ |

#### 本番環境でのCI/CD
##### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

| 名前 | 種類 | 値 |
| ---- | ---- | --- |
| /GbraverBurst/prod/service | String | デプロイする環境のサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する |
| /GbraverBurst/prod/stage | String | デプロイする環境のステージ名、v001、v010などを記入する |
| /GbraverBurst/prod/allowOrigin | String | RestAPIサーバのAccess-Control-Allow-Originを記載 |
| /GbraverBurst/prod/auth0Domain | SecureString | auth0のドメイン |
| /GbraverBurst/prod/auth0JwksUrl | SecureString | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| /GbraverBurst/prod/auth0Audience | SecureString | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| /GbraverBurst/prod/auth0UserManagementAppClientId | SecureString | Auth0 Management API に認証されたApplicationのclient id |
| /GbraverBurst/prod/auth0UserManagementAppClientSecret | SecureString | Auth0 Management API に認証されたApplicationのclient secret |
| /GbraverBurst/prod/dockerUser | SecureString | dockerhubのユーザID |
| /GbraverBurst/prod/dockerToken | SecureString |dcoekrhudのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照  |
| /GbraverBurst/prod/matchMakeEcrRepositoryName | String | マッチメイク用ECRリポジトリ名 |

##### Code Build
以下のCode Buildプロジェクトを生成します

| # | 概要 | BuildSpec | ビルド環境 |
|---|------| --------- | -------- |
| PROCB-01 | テスト | backendAppTest.buildspec.yml | codebuild.node16.Dockerfile |
| PROCB-02 | serverlessデプロイ | serverless.prod.buildspec.yml | codebuild.node16.Dockerfile |
| PROCB-03 | マッチメイクEcrPush| matchMakeContainer.prod.buildspec.yml | ubuntu/standard/5.0 |
| PROCB-04 | バックエンドECSデプロイ| backendEcs.prod.buildspec.yml | codebuild.node16.Dockerfile |

#### Code Pipeline

以下構成のCodePipeLineを作成します。
処理順番が同じものは、並列実行の設定をしてください。

| 処理順番 | CodeBuild |
| ------- | ---------- |
| 001 | PROCB-01.テスト |
| 002 | PROCB-02.serverlessデプロイ |
| 002 | PROCB-03.マッチメイクEcrPush |
| 003 | PROCB-04.バックエンドECSデプロイ |