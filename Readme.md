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
* aws cli
* node.js
* npm
* npx
* Docker

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
* [aws cli 認証設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)
* [VPCの作成](./packages/aws-vpc/README.md#deploy-command)
* 以下ECRリポジトリの作成
  * マッチメイク
* [auth0 API 作成](https://auth0.com/docs/configure/apis)
* [dockerhubアクセストークン発行](https://docs.docker.com/docker-hub/access-tokens/)

## 環境構築方法
### ローカル環境からデプロイする

#### 環境変数の定義
ローカル環境に以下の環境変数を定義します。

| 環境変数名 | 記載内容 |
| --------- | ----------- |
| STAGE | デプロイする環境のステージ名、dev、prodなどを記入する |
| AUTH0_JWKS_URL | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| AUTH0_AUDIENCE | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| MATCH_MAKE_ECR_REPOSITORY_NAME | マッチメイク用ECRリポジトリ名 |
| DOCKER_USER | dockerhubのユーザ名 |
| DOCKER_TOKEN | dcoekrhudのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照|
| AWS_DEFAULT_REGION | デプロイ先のAWSリージョン |

#### serverlessデプロイ

```shell
./serverless-deploy.sh
```

#### ECRリポジトリPush

```shell
./match-make-container-push.sh
```

#### バックエンド処理用ECSデプロイ

```shell
./esc-backend-deploy.sh
```

### CodepipelineでCI/CDする

#### AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

| 名前 | 種類 | 値 |
| ---- | ---- | --- |
| /GbraverBurst/dev/stage | String | デプロイする環境のステージ名、dev、prodなどを記入する |
| /GbraverBurst/dev/auth0JwksUrl | SecureString | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| /GbraverBurst/dev/auth0Audience | SecureString | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| /GbraverBurst/dev/dockerUser | SecureString | dockerhubのユーザID |
| /GbraverBurst/dev/dockerToken | SecureString |dcoekrhudのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照  |
| /GbraverBurst/dev/matchMakeEcrRepositoryName | String | マッチメイク用ECRリポジトリ名 |

#### CodeBuildの作成

以下構成のCodeBuildを作成します。

| # | 概要 | BuildSpec |
| - | ---- | --------- |
| DEVCB-01 | テスト | backendAppTest.buildspec.yml |
| DEVCB-02 | serverlessデプロイ | serverless.buildspec.yml |
| DEVCB-03 | マッチメイクEcrPush| matchMakeContainer.buildspec.yml |
| DEVCB-04 | バックエンドECSデプロイ| backendEcs.buildspec.yml |

#### CodePipelineの作成

以下構成のCodeBuildを作成します。
処理順番が同じものは、並列実行の設定をしてください。

| 処理順番 | CodeBuild |
| ------- | ---------- |
| 001 | DEVCB-01.テスト |
| 002 | DEVCB-02.serverlessデプロイ |
| 002 | DEVCB-03.マッチメイクEcrPush |
| 003 | DEVCB-04.バックエンドECSデプロイ |