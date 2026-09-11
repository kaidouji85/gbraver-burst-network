# 開発環境マニュアル

本書では開発環境の構築手順を記載する。

## 事前準備

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からaccesskeyを生成する。

## AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

- `/GbraverBurst/dev/service`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `SERVICE` を参照
- `/GbraverBurst/dev/anonymousService`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `ANONYMOUS_SERVICE` を参照
- `/GbraverBurst/dev/backendCloudfrontService`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_SERVICE` を参照
- `/GbraverBurst/dev/stage`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `STAGE` を参照
- `/GbraverBurst/dev/backendCloudfrontDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_DOMAIN_NAME` を参照
- `/GbraverBurst/dev/backendCloudfrontCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_CERT_ARN` を参照
- `/GbraverBurst/dev/backendCloudfrontWebAclArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `BACKEND_CLOUDFRONT_WEB_ACL_ARN` を参照、初期値は空欄
- `/GbraverBurst/dev/wsApiDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_DOMAIN_NAME` を参照
- `/GbraverBurst/dev/wsSignalDomainName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_SIGNAL_DOMAIN_NAME` を参照
- `/GbraverBurst/dev/wsSignalCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_SIGNAL_CERT_ARN` を参照
- `/GbraverBurst/dev/wsApiCertArn`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `WS_API_CERT_ARN` を参照
- `/GbraverBurst/dev/anonymousBackendCorsOrigin`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `ANONYMOUS_BACKEND_CORS_ORIGIN` を参照
- `/GbraverBurst/dev/cognitoUserPoolId`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COGNITO_USER_POOL_ID` を参照
- `/GbraverBurst/dev/cognitoClientId`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COGNITO_CLIENT_ID` を参照
- `/GbraverBurst/dev/matchMakeEcrRepositoryName`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `MATCH_MAKE_ECR_REPOSITORY_NAME` を参照
- `/GbraverBurst/dev/dockerUser`
  - SecureString
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `DOCKER_USER` を参照
- `/GbraverBurst/dev/dockerToken`
  - SecureString
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `DOCKER_TOKEN` を参照
- `/GbraverBurst/dev/vpcSubnetCount`
  - String
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `VPC_SUBNET_COUNT` を参照
- `/GbraverBurst/dev/serverlessAccessKey`
  - SecureString
  - serverless dashboardから発行したaccesskey

## AWS Secrets Manager

AWS Secrets Managerに以下のシークレットをセットする。

- `/GbraverBurst/dev/coturnSharedSecret`
  - [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) `COTURN_SHARED_SECRET` を参照

## CodeBuild

以下のCodeBuildプロジェクトを生成する。

- 通常バックエンドのフルデプロイ
  - buildspec.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
  - 備考: 環境新規作成時に利用する想定
- 通常バックエンドのserverless削除
  - buildspec.sls.remove.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- 通常バックエンドのECS削除
  - buildspec.backendEcs.remove.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- 通常バックエンドのserverlessデプロイ
  - buildspec.sls.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: [開発環境CD用webhook](#開発環境cd用webhook)
  - 備考: CI/CDで既存環境をアップデートする際に利用する想定
- 通常バックエンドのECSをホットスワップデプロイ
  - buildspec.backendEcs.hotswap.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: [開発環境CD用webhook](#開発環境cd用webhook)
  - 備考: CI/CDで既存環境をアップデートする際に利用する想定
- 通常バックエンドのECSをデプロイ
  - buildspec.backendEcs.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- 匿名バックエンドをデプロイ
  - buildspec.anonymous.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: [開発環境CD用webhook](#開発環境cd用webhook)
- 匿名バックエンドを削除
  - buildspec.anonymous.remove.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし
- バックエンドCloudFrontのデプロイ
  - buildspec.backendCloudfront.yml
  - 環境: [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0)
  - webhook: なし

### 開発環境cd用webhook

developブランチにpushされた時にCodeBuildが実行されるように、以下のwebhookを設定する。

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
      | 条件        | タイプ   | パターン             |
      | ----------- | -------- | -------------------- |
      | START_BUILD | HEAD_REF | ^refs/heads/develop$ |

## 環境構築手順

### 環境新規作成

1. CodeBuildで「通常バックエンドのフルデプロイ」を実行
2. 以下コマンドでCloudFrontを新規作成する
   ```bash
   export SERVICE=<Parameter Store「/GbraverBurst/dev/service」にセットした値>
   export STAGE=<Parameter Store「/GbraverBurst/dev/stage」にセットした値>
   export ANONYMOUS_SERVICE=<Parameter Store「/GbraverBurst/dev/anonymousService」にセットした値>
   export BACKEND_CLOUDFRONT_SERVICE=<Parameter Store「/GbraverBurst/dev/backendCloudfrontService」にセットした値>
   export BACKEND_CLOUDFRONT_DOMAIN_NAME=<Parameter Store「/GbraverBurst/dev/backendCloudfrontDomainName」にセットした値>
   export BACKEND_CLOUDFRONT_CERT_ARN=<Parameter Store「/GbraverBurst/dev/backendCloudfrontCertArn」にセットした値>
   export BACKEND_CLOUDFRONT_WEB_ACL_ARN=<Parameter Store「/GbraverBurst/dev/backendCloudfrontWebAclArn」にセットした値>
   ./deploy-cloudfront.sh
   ```
3. Parameter Storeの「/GbraverBurst/dev/backendCloudfrontWebAclArn」に2で生成したWebACLのARNをセットする
4. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」にParameter Store「/GbraverBurst/dev/stage」の値を指定して実行

### ブルーグリーンデプロイ

**正常系**

- 0. 事前準備
  - 0.1. Parameter Storeの「/GbraverBurst/dev/stage」の「旧ステージ」をメモする
- 1. 新規環境作成
  - 1.1. Parameter Storeの「/GbraverBurst/dev/stage」に「新ステージ」をセットする
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
