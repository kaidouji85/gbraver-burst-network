# Gブレイバーバースト ネットワーク

Gブレイバーバーストのネットワーク関連モジュールを集めたものです。
本リポジトリの構造は、標準的な[lerna monorepo](https://lerna.js.org) です。

<a id="repository-setup"></a>
## リポジトリセットアップ
本リポジトリをcloneした直後に、以下コマンドを実行してください。
以下コマンドを実行しない場合、内部パッケージの依存関係が解決できないため、
各パッケージ配下に用意されたコマンドが正常動作しない恐れがあります。

```shell
pm ci
npm run bootstrap
npm run build
```

## 環境構築方法

### ローカル環境からデプロイする

#### 1. 前提条件

* ローカル環境に以下ソフトウェアがインストールされていること
  * aws cli
  * node.js
  * npm
  * npx
  * Docker
* [リポジトリセットアップ済](#repository-setup)
* [aws cli 認証設定済](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)
* [auth0 API 作成済](https://auth0.com/docs/configure/apis)

<a id="create-ecr-repository"></a>
#### 2. ECRリポジトリの作成
以下用途のECRリポジトリを作成します。リポジトリ名は自由に設定して構いません。

* マッチメイク用Dockerイメージ

#### 3. 環境変数の定義
ローカル環境に以下の環境変数を定義します。

| 環境変数名 | 記載内容 |
| --------- | ----------- |
| STAGE | デプロイする環境のステージ名、dev、prodなどを記入する |
| AUTH0_JWKS_URL | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| AUTH0_AUDIENCE | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| MATCH_MAKE_ECR_REPOSITORY_NAME | マッチメイク用Dockerイメージを格納したECRリポジトリ名 |


<a id="create-vpc"></a>
#### 4. VPCの作成
[ここ](./packages/aws-vpc/README.md) を参考にVPCを作成します。

#### 5. serverlessデプロイ

```shell
./serverless-deploy.sh
```

#### 6. ECRリポジトリPush
[matchMakeContainer.buildspec.yml](./matchMakeContainer.buildspec.yml) を参考に、ECRリポジトリにPushします。

#### 7. バックエンド処理用ECSデプロイ

```shell
./esc-backend-deploy.sh
```

### CodepipelineでCI/CDする

#### 1. 前提条件
* [ECRリポジトリが作成済み](#create-ecr-repository)
* [VPCが作成済み](#create-vpc)

#### 2. AWS Parameter Storeを設定
AWS Parameter Storeに以下の値をセットします。

| 名前 | 種類 | 値 |
| ---- | ---- | --- |
| /GbraverBurst/dev/stage | String | デプロイする環境のステージ名、dev、prodなどを記入する |
| /GbraverBurst/dev/auth0JwksUrl | SecureString | auth0のjwks.jsonが配置されたURL、詳細は[ここ](https://auth0.com/docs/security/tokens/json-web-tokens/locate-json-web-key-sets) を参照 |
| /GbraverBurst/dev/auth0Audience | SecureString | auth0のaudieceを記載する、詳細は[ここ](https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#control-access-token-audience)を参照 |
| /GbraverBurst/dev/matchMakeEcrRepositoryName | String | マッチメイク用Dockerイメージを格納したECRリポジトリ名 |

#### 3. CodeBuildの作成

以下のCodeBuildを作成します。

| # | 概要 | BuildSpec |
| - | ---- | --------- |
| DEVCB-01 | テスト | backendAppTest.buildspec.yml |
| DEVCB-02 | serverlessデプロイ | serverless.buildspec.yml |
| DEVCB-03 | マッチメイクEcrPush| matchMakeContainer.buildspec.yml |
| DEVCB-04 | バックエンドECSデプロイ| backendEcs.buildspec.yml |

#### 4. CodePipelineの作成

以下の順番で実行されるCodeBuildを作成します。
なお、処理版が同じものは並列実行される想定です。

| 処理順番 | CodeBuild |
| ------- | ---------- |
| 001 | DEVCB-01.テスト |
| 002 | DEVCB-02.serverlessデプロイ |
| 002 | DEVCB-03.マッチメイクEcrPush |
| 003 | DEVCB-04.バックエンドECSデプロイ |