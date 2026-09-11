# 本番環境マニュアル

本書では本番環境の構築手順を記載する。

## 事前準備

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からaccesskeyを生成する。

## AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

- `/GbraverBurst/prod/service`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `SERVICE` を参照
- `/GbraverBurst/prod/anonymousService`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `ANONYMOUS_SERVICE` を参照
- `/GbraverBurst/prod/backendCloudfrontService`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_SERVICE` を参照
- `/GbraverBurst/prod/stage`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `STAGE` を参照
- `/GbraverBurst/prod/backendCloudfrontDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_DOMAIN_NAME` を参照
- `/GbraverBurst/prod/backendCloudfrontCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_CERT_ARN` を参照
- `/GbraverBurst/prod/backendCloudfrontWebAclArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_WEB_ACL_ARN` を参照、初期値は空欄
- `/GbraverBurst/prod/wsApiDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_DOMAIN_NAME` を参照
- `/GbraverBurst/prod/wsSignalDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_SIGNAL_DOMAIN_NAME` を参照
- `/GbraverBurst/prod/wsSignalCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_SIGNAL_CERT_ARN` を参照
- `/GbraverBurst/prod/wsApiCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_CERT_ARN` を参照
- `/GbraverBurst/prod/anonymousBackendCorsOrigin`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `ANONYMOUS_BACKEND_CORS_ORIGIN` を参照
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

## AWS Secrets Manager

AWS Secrets Managerに以下のシークレットをセットする。

- `/GbraverBurst/prod/coturnSharedSecret`
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COTURN_SHARED_SECRET` を参照

## CodeBuild

以下のCodeBuildプロジェクトを生成する。

- 通常バックエンドのフルデプロイ
  - buildspec.prod.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: [本番環境CD用webhook](#本番環境cd用webhook) |
- 通常バックエンドのserverless削除
  - buildspec.sls.remove.prod.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- 通常バックエンドのECS削除
  - buildspec.backendEcs.remove.prod.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- 匿名バックエンドを削除
  - buildspec.anonymous.remove.prod.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- バックエンドCloudFrontのデプロイ
  - buildspec.backendCloudfront.prod.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし

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

## 環境構築手順

### 環境新規作成

1. CodeBuildで「通常バックエンドのフルデプロイ」を実行
2. 以下コマンドでCloudFrontを新規作成する
   ```bash
   export SERVICE=<Parameter Store「/GbraverBurst/prod/service」にセットした値>
   export STAGE=<Parameter Store「/GbraverBurst/prod/stage」にセットした値>
   export ANONYMOUS_SERVICE=<Parameter Store「/GbraverBurst/prod/anonymousService」にセットした値>
   export BACKEND_CLOUDFRONT_SERVICE=<Parameter Store「/GbraverBurst/prod/backendCloudfrontService」にセットした値>
   export BACKEND_CLOUDFRONT_DOMAIN_NAME=<Parameter Store「/GbraverBurst/prod/backendCloudfrontDomainName」にセットした値>
   export BACKEND_CLOUDFRONT_CERT_ARN=<Parameter Store「/GbraverBurst/prod/backendCloudfrontCertArn」にセットした値>
   ./deploy-backend-cloudfont.bash
   ```
3. Parameter Storeの「/GbraverBurst/prod/backendCloudfrontWebAclArn」に2で生成したWebACLのARNをセットする
4. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」にParameter Store「/GbraverBurst/prod/stage」の値を指定して実行

### ブルーグリーンデプロイ

**正常系**

- 0. 事前準備
  - 0.1. Parameter Storeの「/GbraverBurst/prod/stage」の「旧ステージ」をメモする
- 1. 新規環境作成
  - 1.1. Parameter Storeの「/GbraverBurst/prod/stage」に「新ステージ」をセットする
  - 1.2. CodeBuildで「通常バックエンドのフルデプロイ」を実行
  - 1.3. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」に「新ステージ」を指定して実行
- 2. 旧環境削除
  - 2.1. CodeBuildで「通常バックエンドのECS削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 2.2. CodeBuildで「通常バックエンドのserverless削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 2.3. CodeBuildで「匿名バックエンドの削除」を環境変数「STAGE」に「旧ステージ」を指定して実行

**リリース失敗時**

- 1. 旧環境への切り戻し
  - 1.1. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」に「旧ステージ」を指定して実行
- 2. 新規作成環境の削除
  - 2.1. CodeBuildで「通常バックエンドのECS削除」を環境変数「STAGE」に「新ステージ」を指定して実行
  - 2.2. CodeBuildで「通常バックエンドのserverless削除」を環境変数「STAGE」に「新ステージ」を指定して実行
  - 2.3. CodeBuildで「匿名バックエンドの削除」を環境変数「STAGE」に「新ステージ」を指定して実行
