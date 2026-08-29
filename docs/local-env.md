# ローカル環境マニュアル

本書ではローカル環境での開発に必要な事前作業、環境変数の定義、デプロイ手順を述べる。

## 1. 各種ツールの認証設定

- [ここ](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)を参考に`cdk bootstrap`を実行する
- [ここ](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html)を参考にaws cliの認証設定をする
- [ここ](https://www.serverless.com/framework/docs-guides-upgrading-v4)を参考にserverless cliの認証設定をする

## 2. モノレポの依存パッケージ解決

```shell
npm ci
npm run build
```

## 3. 環境変数の定義

ローカル環境に以下の環境変数を定義する。

- `SERVICE`
  - デプロイするWebSocket APIのサービス名
    - 推奨値
      - gbraver-burst-sls-dev
        - 開発環境用
      - gbraver-burst-sls-prod
        - 本番環境用
- `ANONYMOUS_SERVICE`
  - デプロイする匿名バックエンドのサービス名
    - 推奨値
      - gbraver-burst-anonymous-dev
        - 開発環境用
      - gbraver-burst-anonymous-prod
        - 本番環境用
- `BACKEND_CLOUDFRONT_SERVICE`
  - バックエンドAPIの前段に配置するCloudFrontのサービス名、gb-backend-cloudfront-dev、gb-backend-cloudfront-prodなどを記入する
- `STAGE`
  - デプロイする環境のステージ名を記入する
- `BACKEND_CLOUDFRONT_DOMAIN_NAME`
  - バックエンドAPIの前段に配置するCloudFrontのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある。
- `BACKEND_CLOUDFRONT_CERT_ARN`
  - バックエンドAPIの前段に配置するCloudFrontのSSL証明書ARN、本証明書はAWS ACMで発行されたBACKEND_CLOUDFRONT_DOMAIN_NAMEのワイルドカード証明書である必要がある。
- `BACKEND_CLOUDFRONT_WEB_ACL_ARN`
  - バックエンドAPIの前段に配置するCloudFrontにアタッチするWebACLのARN、WebACLを関連づけない場合は空文字を指定する
- `WS_API_DOMAIN_NAME`
  - WebSocket APIのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある
- `WS_API_CERT_ARN`
  - WebSocket APIのSSL証明書ARN、本証明書はAWS ACMで発行されたWS_API_DOMAIN_NAMEのワイルドカード証明書である必要がある
- `WS_SIGNAL_DOMAIN_NAME`
  - シグナルサーバーのドメイン名、本ドメイン名はRoute53にホストゾーンが存在している必要がある
- `WS_SIGNAL_CERT_ARN`
  - シグナルサーバーのSSL証明書ARN、本証明書はAWS ACMで発行されたWS_SIGNAL_DOMAIN_NAMEのワイルドカード証明書である必要がある
- `ANONYMOUS_BACKEND_CORS_ORIGIN`
  - 匿名バックエンドのCORS設定で許可するオリジン
- `COTURN_SHARED_SECRET`
  - coturnサーバーで使用する共有秘密鍵を保存したAWS Secrets Managerのシークレット名
- `COGNITO_USER_POOL_ID`
  - CognitoのユーザープールID
- `COGNITO_CLIENT_ID`
  - CognitoのクライアントID
- `MATCH_MAKE_ECR_REPOSITORY_NAME`
  - マッチメイク用ECRのリポジトリ名
- `DOCKER_IMAGE_TAG`
  - デプロイするDockerイメージのタグ、gitのコミットタグをセットする想定
- `DOCKER_USER`
  - Docker Hubのユーザ名
- `DOCKER_TOKEN`
  - Docker Hubのアクセストークン、詳細は[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参照
- `AWS_DEFAULT_REGION`
  - デプロイ先のAWSリージョン
- `VPC_SUBNET_COUNT`
  - FARGATEが動作するVPCのPublicサブネット個数

## 4. デプロイ

ローカル環境からバックエンドアプリをAWSにデプロイする手順を述べる。

### 4.1. 初回デプロイ

各モジュールには依存関係があるので、以下の順番で初回デプロイを行う必要がある。

```shell
# serverlessデプロイ
./deploy-serverless.bash

# ECRリポジトリPush
./push-match-make-container.bash

# Fargate通常デプロイ
./deploy-backend-ecs.bash

# 匿名バックエンドデプロイ
./deploy-anonymous.bash
```

### 4.2. 2回目以降のデプロイ

各モジュールのI/Oに変更がなければ、4.1のスクリプトを任意の順番で実行してよい。
また、Fargateにはホットスワップデプロイのスクリプトも用意されている。

```shell
# Fargateホットスワップデプロイ
./deploy-backend-ecs-with-hotswap.bash
```

## 5. スタブによる動作確認

本リポジトリにはブラウザ用SDKが含まれているので、スタブによりE2Eの動作確認が可能である。
詳細は以下のドキュメントを参照。

- [通常バックエンドのスタブ](../packages/serverless-stub/Readme.md)
- [匿名バックエンドのスタブ](../packages/anonymous-stub/Readme.md)

## 6. 環境削除

各モジュールには依存関係があるので、以下の順番で環境削除を行う必要がある。

```shell
# Fargate削除
./remove-backend-ecs.bash

# サーバーレス削除
./remove-serverless.bash

# シグナルサーバー削除
./remove-ws-signal.bash
```
