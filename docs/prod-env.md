# 本番環境マニュアル

本書では本番環境の構築手順を記載する。

## 事前準備

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からaccesskeyを生成する。

## AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

- `/GbraverBurst/prod/service`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `SERVICE` を参照
- `/GbraverBurst/prod/stage`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `STAGE` を参照
- `/GbraverBurst/prod/wsApiDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_DOMAIN_NAME` を参照
- `/GbraverBurst/prod/wsApiCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_CERT_ARN` を参照
- `/GbraverBurst/prod/cognitoUserPoolId`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COGNITO_USER_POOL_ID` を参照
- `/GbraverBurst/prod/cognitoClientId`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COGNITO_CLIENT_ID` を参照
- `/GbraverBurst/prod/matchMakeEcrRepositoryName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `MATCH_MAKE_ECR_REPOSITORY_NAME` を参照
- `/GbraverBurst/prod/dockerUser`
  - SecureString
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `DOCKER_USER` を参照
- `/GbraverBurst/prod/dockerToken`
  - SecureString
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `DOCKER_TOKEN` を参照
- `/GbraverBurst/prod/vpcSubnetCount`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `VPC_SUBNET_COUNT` を参照
- `/GbraverBurst/prod/serverlessAccessKey`
  - SecureString
  - serverless dashboardから発行したaccesskey

## Code Build

以下のCode Buildプロジェクトを生成する。

| 役割                             | buildspec                            | 環境                                                                                                                       | 　webhook                                   |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 通常バックエンドのフルデプロイ   | buildspec.prod.yml                   | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [本番環境CD用webhook](#本番環境cd用webhook) |
| 通常バックエンドのserverless削除 | buildspec.sls.remove.prod.yml        | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| 通常バックエンドのECS削除        | buildspec.backendEcs.remove.prod.yml | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |

### 本番環境cd用webhook

masterブランチにpushされた時にCodeBuildが実行されるように、以下のwebhookを設定する。

- **コードの変更がこのレポジトリにプッシュされるたびに再構築する**
  - チェックを入れる
- **ビルドタイプ**
  - 単一ビルド
- **コメント承認**
  - DISABLED
- **ウェブフックイベントフィルタグループ**
  - **フィルタグループ 1**
    - **イベントタイプ**
      - プッシュ
    - **フィルター**
      | 条件        | タイプ   | パターン            |
      | ----------- | -------- | ------------------- |
      | START_BUILD | HEAD_REF | ^refs/heads/master$ |

## 環境新規作成

1. CodeBuildで「通常バックエンドのフルデプロイ」を実行

## ブルーグリーンデプロイ

- 0. 事前準備
  - 0.1. Parameter Storeの「/GbraverBurst/prod/stage」の「旧ステージ」をメモする
- 1. 新規環境作成
  - 1.2. Parameter Storeの「/GbraverBurst/prod/stage」に「新ステージ」をセットする
  - 1.3. CodeBuildで「通常バックエンドのフルデプロイ」を実行
- 2. 旧環境削除
  - 2.1. CodeBuildで「通常バックエンドのECS削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 2.2. CodeBuildで「通常バックエンドのserverless削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
