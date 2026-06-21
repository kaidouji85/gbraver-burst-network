# Gブレイバーバースト ネットワーク

本リポジトリは、Gブレイバーバーストのネットワーク関連モジュールである。
リポジトリは[npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[turborepo](https://turbo.build/repo/docs/handbook)
を用いたモノレポ構造となっている。
特に断りがない限り、本書のコマンド例のカレントディレクトリは`本リポジトリをcloneした場所の直下`であるとする。

## リポジトリ構成解説

本リポジトリは、以下の3サービスを提供している。

- ユーザー登録必須API（AWS環境）
- ログインなしAPI（AWS環境）
- オフライン対戦サーバー（イントラネット環境）

本リポジトリは`packages`ディレクトリに、以下のモジュールが配置されている。

| サービス               | パッケージ名             | 説明                                                                                             |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| ユーザー登録必須API    | aws-vpc                  | VPCを構築するAWS CDKプロジェクト                                                                 |
| ユーザー登録必須API    | backend-app              | ユーザー登録必須の各種APIを実装したServerless Frameworkプロジェクト                              |
| ユーザー登録必須API    | backend-ecs              | カジュアルマッチを行う常時起動しているFargate環境を構築するAWS CDKプロジェクト                   |
| ユーザー登録必須API    | browser-sdk              | ユーザー登録必須のAPIを呼び出すためのブラウザ向けSDKを実装したnpmパッケージ                      |
| ユーザー登録必須API    | serverless-stub          | ログイン必須APIを呼び出すためのローカルで動作するスタブサーバーを実装したTypeScriptプロジェクト  |
| ログインなしAPI        | cloudfront               | 各種CloudFrontを構築するCloudFormationテンプレート                                               |
| ログインなしAPI        | ws-signal                | シグナルサーバーを構築するServerless Frameworkプロジェクト                                       |
| ログインなしAPI        | local-webrtc-browser-sdk | ログインなしAPIを呼び出すためのブラウザ向けSDKを実装したnpmパッケージ                            |
| ログインなしAPI        | local-webrtc-stub        | ログインなしAPIを呼び出すためのローカルで動作するスタブサーバーを実装したTypeScriptプロジェクト  |
| オフライン対戦サーバー | offline-backend-app      | オフライン対戦サーバーを実装したTypeScriptプロジェクト                                           |
| オフライン対戦サーバー | offline-browser-sdk      | オフライン対戦クライアントを実装したブラウザ向けSDKを実装したnpmパッケージ                       |
| オフライン対戦サーバー | offline-stub             | オフライン対戦サーバーをローカルで動作させるためのスタブサーバーを実装したTypeScriptプロジェクト |

**ユーザー登録必須APIの依存関係**

```mermaid
graph TD;
    backend-ecs-->aws-vpc;
    backend-ecs-->backend-app;
    browser-sdk-->backend-app;
    serverless-stub-->backend-app;
    serverless-stub-->browser-sdk;
```

**ログインなしAPIの依存関係**

```mermaid
graph TD;
    ws-signal-->cloudfront;
    local-webrtc-browser-sdk-->ws-signal;
    local-webrtc-stub-->ws-signal;
    local-webrtc-stub-->local-webrtc-browser-sdk;
```

**オフライン対戦サーバーの依存関係**

```mermaid
graph TD;
    offline-browser-sdk-->offline-backend-app;
    offline-stub-->offline-backend-app;
    offline-stub-->offline-browser-sdk;
```

## 必須ソフト一覧

- aws cli(2.3.4以上)
- node.js(v18.16.0以上)
- npm(9.5.1以上)
- npx(9.5.1以上)
- Docker(20.10.8以上)

## 必須アカウント一覧

- [AWS](https://aws.amazon.com/jp/?nc2=h_lg)
- [Docker Hub](https://hub.docker.com/)
- [serverless dashboard](https://www.serverless.com/dashboard)

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

- CognitoユーザープールのサインインオプションはEメールに設定する **(後から変更できない)**
- Hosted UIを有効にする
  - スコープにopenid, email, profile、phone、aws.cognito.signin.user.adminを追加する
- 許可されているコールバック URL、許可されているサインアウト URLに`http://localhost:8080`、GブレイバーバーストをホストしているURLを設定する
- 検証メッセージの検証タイプを`Link`に設定する

### 6. CognitoにGooogleのソーシャルログインを追加

Google Play ConsoleでOAuth2.0クライアントIDを以下条件で追加する。
この時に生成されるクライアントIDとクライアントシークレットを控えておく。

- 承認済みのリダイレクト URIに`https://<Cognitoのドメイン>/oauth2/idpresponse`を追加する

CognitoのアイデンティティプロバイダーにGoogleを以下条件で追加する。

- 許可されたスコープは`profile email openid`を指定
- 属性マッピングは以下のように設定

| Cognito属性        | Google属性 |
| ------------------ | ---------- |
| email              | email      |
| picture            | picture    |
| preferred_username | name       |

CgonitoのホストされたUIのID プロバイダーにGoogleを追加する。

### 7. 各種ドメイン名の準備

#### 7.1. APIサーバー用のドメイン名およびACM証明書の準備

APIサーバー用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はAPIサーバー用のドメイン名のワイルドカード証明書である必要がある。

例

- APIサーバー用のドメイン名: ws-api.example.com
- ACM証明書: \*.ws-api.example.com

#### 7.2. シグナルサーバー用のドメイン名およびACM証明書の準備

シグナルサーバー用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はシグナルサーバー用のドメイン名のワイルドカード証明書である必要がある。

例

- シグナルサーバー用のドメイン名: ws-signal.example.com
- ACM証明書: \*.ws-signal.example.com

#### 7.3. バックエンドCloudFront用のドメイン名およびACM証明書の準備

バックエンドCloudFront用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はバックエンドCloudFront用のドメイン名のワイルドカード証明書である必要がある。

例

- バックエンドCloudFront用のドメイン名: backend.example.com
- ACM証明書: \*.backend.example.com

### 8. coturnサーバーの構築

以下手順書に従ってcoturnサーバーを構築する。  
[coturnセットアップ手順（さくらのVPS / Debian）](./coturn-manual.md)

## ローカル環境からのデプロイ方法

### 1. 各種ツールの認証設定

- [ここ](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)を参考に`cdk bootstrap`を実行する
- [ここ](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考にaws cliの認証設定をする
- [ここ](https://www.serverless.com/framework/docs-guides-upgrading-v4)を参考にserverless cliの認証設定をする

### 2. モノレポの依存パッケージ解決

```shell
pm ci
npm run build
```

### 3. 環境変数の定義

ローカル環境に以下の環境変数を定義する。

| 環境変数名                     | 記載内容                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SERVICE                        | デプロイするWebSocket APIのサービス名、gbraver-burst-sls-dev、gbraver-burst-sls-prodなどを記入する                                                           |
| WS_SIGNAL_SERVICE              | デプロイするシグナルサーバーのサービス名、gb-ws-signal-dev、gb-ws-signal-prodなどを記入する                                                                  |
| BACKEND_CLOUDFRONT_SERVICE     | バックエンドAPIの前段に配置するCloudFrontのサービス名、gb-backend-cloudfront-dev、gb-backend-cloudfront-prodなどを記入する                                   |
| STAGE                          | デプロイする環境のステージ名を記入する                                                                                                                       |
| BACKEND_CLOUDFRONT_DOMAIN_NAME | バックエンドAPIの前段に配置するCloudFrontのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある。                                         |
| BACKEND_CLOUDFRONT_CERT_ARN    | バックエンドAPIの前段に配置するCloudFrontのSSL証明書ARN、本証明書はAWS ACMで発行されたBACKEND_CLOUDFRONT_DOMAIN_NAMEのワイルドカード証明書である必要がある。 |
| BACKEND_CLOUDFRONT_WEB_ACL_ARN | バックエンドAPIの前段に配置するCloudFrontにアタッチするWebACLのARN、WebACLを関連づけない場合は空文字を指定する                                               |
| WS_API_DOMAIN_NAME             | WebSocket APIのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある                                                                       |
| WS_API_CERT_ARN                | WebSocket APIのSSL証明書ARN、本証明書はAWS ACMで発行されたWS_API_DOMAIN_NAMEのワイルドカード証明書である必要がある                                           |
| WS_SIGNAL_DOMAIN_NAME          | シグナルサーバーのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある                                                                    |
| WS_SIGNAL_CERT_ARN             | シグナルサーバーのSSL証明書ARN、本証明書はAWS ACMで発行されたWS_SIGNAL_DOMAIN_NAMEのワイルドカード証明書である必要がある                                     |
| WEBRTC_HELPER_CORS_ORIGIN      | WebRTC Helper APIのCORS設定で許可するオリジン                                                                                                                |
| COTURN_SHARED_SECRET           | coturnサーバーで使用する共有秘密鍵を保存したAWS Secrets Managerのシークレット名                                                                              |
| COGNITO_USER_POOL_ID           | CognitoのユーザープールID                                                                                                                                    |
| COGNITO_CLIENT_ID              | CognitoのクライアントID                                                                                                                                      |
| MATCH_MAKE_ECR_REPOSITORY_NAME | [2. マッチメイク用ECRリポジトリ作成](#2-マッチメイク用ecrリポジトリ作成)で作成したマッチメイク用ECRのリポジトリ名                                            |
| DOCKER_IMAGE_TAG               | デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定                                                                                          |
| DOCKER_USER                    | Docker Hubのユーザ名                                                                                                                                         |
| DOCKER_TOKEN                   | Docker Hubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照                                                          |
| AWS_DEFAULT_REGION             | デプロイ先のAWSリージョン                                                                                                                                    |
| VPC_SUBNET_COUNT               | FARGATEが動作するVPCのPublicサブネット個数                                                                                                                   |

### 4. デプロイ

#### 4.1. 初回デプロイ

各モジュールには依存関係があるので、以下の順番で初回デプロイを行う必要がある。

```shell
# serverlessデプロイ
./deploy-serverless.bash

# ECRリポジトリPush
./push-match-make-container.bash

# Fargate通常デプロイ
./deploy-backend-ecs.bash

# シグナルサーバーデプロイ
./deploy-ws-signal.bash
```

### 4.2. 2回目以降のデプロイ

各モジュールのI/Oに変更がなければ、4.1のスクリプトを任意の順番で実行してよい。
また、Fargateにはホットスワップデプロイのスクリプトも用意されている。

```shell
# Fargateホットスワップデプロイ
./deploy-backend-ecs-with-hotswap.bash
```

### 5. 環境削除

各モジュールには依存関係があるので、以下の順番で環境削除を行う必要がある。

```shell
# Fargate削除
./remove-backend-ecs.bash

# サーバーレス削除
./remove-serverless.bash

# シグナルサーバー削除
./remove-ws-signal.bash
```

## GitHub Actions CI環境構築方法

### 事前作業

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する
- AWSで「SlsCli用IAMポリシー」をアタッチしたIAMユーザーを作成し、アクセスキーIDとシークレットキーを控えておく

**SlsCli用IAMポリシー**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudformation:DescribeStackResource",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

### Secrets設定

[ここ](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)を参考にGitHub
ActionsのSecretsを設定する。
以下が設定内容である。

| シークレット名        | 値                                        |
| --------------------- | ----------------------------------------- |
| SERVERLESS_ACCESS_KEY | serverless dashboardから発行したaccesskey |
| AWS_ACCESS_KEY_ID     | AWS IMAユーザー アクセスキーID            |
| AWS_SECRET_ACCESS_KEY | AWS IMAユーザー シークレットキー          |

## AWS CodeBuild CD環境構築方法

### 事前作業

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からasccesskeyを生成する。

### AWS CodeBuild開発環境

#### AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

| 名前                                          | 種類         | 値                                                                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| /GbraverBurst/dev/service                     | String       | [環境変数定義の定義](#環境変数の定義) SERVICE を参照                        |
| /GbraverBurst/dev/wsSignalService             | String       | [環境変数定義の定義](#環境変数の定義) WS_SIGNAL_SERVICE を参照              |
| /GbraverBurst/dev/backendCloudfrontService    | String       | [環境変数定義の定義](#環境変数の定義) BACKEND_CLOUDFRONT_SERVICE を参照     |
| /GbraverBurst/dev/stage                       | String       | [環境変数定義の定義](#環境変数の定義) STAGE を参照                          |
| /GbraverBurst/dev/backendCloudfrontDomainName | String       | [環境変数定義の定義](#環境変数の定義) BACKEND_CLOUDFRONT_DOMAIN_NAME を参照 |
| /GbraverBurst/dev/backendCloudfrontCertArn    | String       | [環境変数定義の定義](#環境変数の定義) BACKEND_CLOUDFRONT_CERT_ARN を参照    |
| /GbraverBurst/dev/backendCloudfrontWebAclArn  | String       | [環境変数定義の定義](#環境変数の定義) BACKEND_CLOUDFRONT_WEB_ACL_ARN を参照 |
| /GbraverBurst/dev/wsApiDomainName             | String       | [環境変数定義の定義](#環境変数の定義) WS_API_DOMAIN_NAME を参照             |
| /GbraverBurst/dev/wsSignalDomainName          | String       | [環境変数定義の定義](#環境変数の定義) WS_SIGNAL_DOMAIN_NAME を参照          |
| /GbraverBurst/dev/wsSignalCertArn             | String       | [環境変数定義の定義](#環境変数の定義) WS_SIGNAL_CERT_ARN を参照             |
| /GbraverBurst/dev/wsApiCertArn                | String       | [環境変数定義の定義](#環境変数の定義) WS_API_CERT_ARN を参照                |
| /GbraverBurst/dev/webrtcHelperCorsOrigin      | String       | [環境変数定義の定義](#環境変数の定義) WEBRTC_HELPER_CORS_ORIGIN を参照      |
| /GbraverBurst/dev/cognitoUserPoolId           | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/dev/cognitoClientId             | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/dev/matchMakeEcrRepositoryName  | String       | [環境変数定義の定義](#環境変数の定義) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/dev/dockerUser                  | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_USER を参照                    |
| /GbraverBurst/dev/dockerToken                 | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_TOKEN を参照                   |
| /GbraverBurst/dev/vpcSubnetCount              | String       | [環境変数定義の定義](#環境変数の定義) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/dev/serverlessAccessKey         | SecureString | serverless dashboardから発行したaccesskey                                   |

#### AWS Secrets Manager

AWS Secrets Managerに以下のシークレットをセットする。

| シークレットの名前                   | シークレットのタイプ                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| /GbraverBurst/dev/coturnSharedSecret | [環境変数定義の定義](#環境変数の定義) COTURN_SHARED_SECRET を参照 |

#### CodeBuild

以下のCodeBuildプロジェクトを生成する。

| 役割                                                                                         | buildspec                        | 環境                                                                                                                       | webhook                                     |
| -------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| フルデプロイ（環境新規作成時に利用する想定）                                                 | buildspec.yml                    | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| serverless削除                                                                               | buildspec.sls.remove.yml         | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| バックエンドECS削除                                                                          | buildspec.backendEcs.remove.yml  | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| serverlessデプロイ（CI/CDで既存環境をアップデートする際に利用する想定）                      | buildspec.sls.yml                | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| バックエンドecsをホットスワップデプロイ（CI/CDで既存環境をアップデートする際に利用する想定） | buildspec.backendEcs.hotswap.yml | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| バックエンドECS通常デプロイ                                                                  | buildspec.backendEcs.yml         | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| シグナルサーバーデプロイ                                                                     | buildspec.wsSignal.yml           | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [開発環境CD用webhook](#開発環境cd用webhook) |
| シグナルサーバー削除                                                                         | buildspec.wsSignal.remove.yml    | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| バックエンドCloudFrontデプロイ                                                               | buildspec.backendCloudfront.yml  | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |

##### webhook

###### 開発環境CD用webhook

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
      | 条件 | タイプ | パターン |
      |-----|--------|---------|
      |START_BUILD |HEAD_REF | ^refs/heads/develop$ |

### AWS CodeBuild本番環境

#### AWS Parameter Store

AWS Parameter Storeに以下の値をセットする。

| 名前                                          | 種類         | 値                                                                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| /GbraverBurst/prod/service                    | String       | [環境変数定義の定義](#環境変数の定義) SERVICE を参照                        |
| /GbraverBurst/prod/stage                      | String       | [環境変数定義の定義](#環境変数の定義) STAGE を参照                          |
| /GbraverBurst/prod/wsApiDomainName            | String       | [環境変数定義の定義](#環境変数の定義) WS_API_DOMAIN_NAME を参照             |
| /GbraverBurst/prod/wsApiCertArn               | String       | [環境変数定義の定義](#環境変数の定義) WS_API_CERT_ARN を参照                |
| /GbraverBurst/prod/cognitoUserPoolId          | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_USER_POOL_ID を参照           |
| /GbraverBurst/prod/cognitoClientId            | String       | [環境変数定義の定義](#環境変数の定義) COGNITO_CLIENT_ID を参照              |
| /GbraverBurst/prod/matchMakeEcrRepositoryName | String       | [環境変数定義の定義](#環境変数の定義) MATCH_MAKE_ECR_REPOSITORY_NAME を参照 |
| /GbraverBurst/prod/dockerUser                 | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_USER を参照                    |
| /GbraverBurst/prod/dockerToken                | SecureString | [環境変数定義の定義](#環境変数の定義) DOCKER_TOKEN を参照                   |
| /GbraverBurst/prod/vpcSubnetCount             | String       | [環境変数定義の定義](#環境変数の定義) VPC_SUBNET_COUNT を参照               |
| /GbraverBurst/prod/serverlessAccessKey        | SecureString | serverless dashboardから発行したaccesskey                                   |

#### Code Build

以下のCode Buildプロジェクトを生成する。

| 役割                | buildspec                            | 環境                                                                                                                       | 　webhook                                   |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| デプロイ            | buildspec.prod.yml                   | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | [本番環境CD用webhook](#本番環境cd用webhook) |
| serverless削除      | buildspec.sls.remove.prod.yml        | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |
| バックエンドECS削除 | buildspec.backendEcs.remove.prod.yml | [amazonlinux-aarch64-standard:3.0](https://github.com/aws/aws-codebuild-docker-images/tree/master/al/aarch64/standard/3.0) | なし                                        |

##### webhook

###### 本番環境CD用webhook

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
      | 条件 | タイプ | パターン |
      |-----|--------|---------|
      |START_BUILD |HEAD_REF | ^refs/heads/master$ |

## パッケージ公開

**通常**

```shell
# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version
npm install

npm run build
npx changeset publish
```

**β版**

```shell
# β版モード開始
npx changeset pre enter beta

# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version
npm install

npm run build
npx changeset publish

# β版モード終了
npx changeset pre exit
```

## License

MIT
