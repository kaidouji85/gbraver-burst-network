# 開発環境マニュアル

本書では開発環境の構築手順を記載する。

## 事前準備

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からaccesskeyを生成する。

## AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

| 名前                                          | 種類         | 値                                                                                                                 |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| /GbraverBurst/dev/service                     | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) SERVICE を参照                        |
| /GbraverBurst/dev/wsSignalService             | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) WS_SIGNAL_SERVICE を参照              |
| /GbraverBurst/dev/backendCloudfrontService    | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) BACKEND_CLOUDFRONT_SERVICE を参照     |
| /GbraverBurst/dev/stage                       | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) STAGE を参照                          |
| /GbraverBurst/dev/backendCloudfrontDomainName | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) BACKEND_CLOUDFRONT_DOMAIN_NAME を参照 |
| /GbraverBurst/dev/backendCloudfrontCertArn    | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) BACKEND_CLOUDFRONT_CERT_ARN を参照    |
| /GbraverBurst/dev/backendCloudfrontWebAclArn  | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) BACKEND_CLOUDFRONT_WEB_ACL_ARN を参照 |
| /GbraverBurst/dev/wsApiDomainName             | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) WS_API_DOMAIN_NAME を参照             |
| /GbraverBurst/dev/wsSignalDomainName          | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) WS_SIGNAL_DOMAIN_NAME を参照          |
| /GbraverBurst/dev/wsSignalCertArn             | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) WS_SIGNAL_CERT_ARN を参照             |
| /GbraverBurst/dev/wsApiCertArn                | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) WS_API_CERT_ARN を参照                |
| /GbraverBurst/dev/anonymousBackendCorsOrigin  | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) ANONYMOUS_BACKEND_CORS_ORIGIN を参照  |
| /GbraverBurst/dev/cognitoUserPoolId           | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/dev/cognitoClientId             | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/dev/matchMakeEcrRepositoryName  | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/dev/dockerUser                  | SecureString | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) DOCKER_USER を参照                    |
| /GbraverBurst/dev/dockerToken                 | SecureString | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) DOCKER_TOKEN を参照                   |
| /GbraverBurst/dev/vpcSubnetCount              | String       | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/dev/serverlessAccessKey         | SecureString | serverless dashboardから発行したaccesskey                                                                          |

## AWS Secrets Manager

AWS Secrets Managerに以下のシークレットをセットする。

| シークレットの名前                   | シークレットのタイプ                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| /GbraverBurst/dev/coturnSharedSecret | [ローカル環境マニュアル/環境変数定義の定義](./local-env.md#3-環境変数の定義) COTURN_SHARED_SECRET を参照 |

## CodeBuild

以下のCodeBuildプロジェクトを生成する。

| 役割                                                                                               | buildspec                        | 環境                                                                                                                       | webhook                                     |
| -------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 通常バックエンドのフルデプロイ（環境新規作成時に利用する想定）                                     | buildspec.yml                    | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| 通常バックエンドのserverless削除                                                                   | buildspec.sls.remove.yml         | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| 通常バックエンドのECS削除                                                                          | buildspec.backendEcs.remove.yml  | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| 通常バックエンドのserverlessデプロイ（CI/CDで既存環境をアップデートする際に利用する想定）          | buildspec.sls.yml                | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| 通常バックエンドのECSをホットスワップデプロイ（CI/CDで既存環境をアップデートする際に利用する想定） | buildspec.backendEcs.hotswap.yml | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| 通常バックエンドのECSをデプロイ                                                                    | buildspec.backendEcs.yml         | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| 匿名バックエンドのシグナルサーバーデプロイ                                                         | buildspec.wsSignal.yml           | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| 匿名バックエンドのシグナルサーバー削除                                                             | buildspec.wsSignal.remove.yml    | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| バックエンドCloudFrontのデプロイ                                                                   | buildspec.backendCloudfront.yml  | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |

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

## 環境構築　手順

### 環境新規作成

1. CodeBuildで「通常バックエンドのフルデプロイ」を実行
2. CodeBuildで「匿名バックエンドのシグナルサーバーデプロイ」を実行
3. CodeBuildで「バックエンドCloudFrontのデプロイ」を実行
4. Route53、AWS Certificate Managerを用いてCloudFrontのドメイン名、SSL証明書を設定する

### ブルーグリーンデプロイ

- 0. 事前準備
  - 0.1. Parameter Storeの「/GbraverBurst/dev/stage」の「旧ステージ」をメモする
- 1. 新規環境作成
  - 1.2. Parameter Storeの「/GbraverBurst/dev/stage」に「新ステージ」をセットする
  - 1.3. CodeBuildで「通常バックエンドのフルデプロイ」を実行
  - 1.4. CodeBuildで「匿名バックエンドのシグナルサーバーデプロイ」を実行
  - 1.5. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」に「新ステージ」を指定して実行
- 2. 旧環境への切り戻し（必要に応じて）
  - 2.1. CodeBuildで「バックエンドCloudFrontのデプロイ」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 2.2. CodeBuildで「通常バックエンドのECS削除」を環境変数「STAGE」に「新ステージ」を指定して実行
  - 2.3. CodeBuildで「通常バックエンドのserverless削除」を環境変数「STAGE」に「新ステージ」を指定して実行
  - 2.4. CodeBuildで「匿名バックエンドのシグナルサーバー削除」を環境変数「STAGE」に「新ステージ」を指定して実行
- 3. 旧環境削除
  - 3.1. CodeBuildで「通常バックエンドのECS削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 3.2. CodeBuildで「通常バックエンドのserverless削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
  - 3.3. CodeBuildで「匿名バックエンドのシグナルサーバー削除」を環境変数「STAGE」に「旧ステージ」を指定して実行
