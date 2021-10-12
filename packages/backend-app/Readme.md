# Gブレイバーバースト バックエンド アプリ

本リポジトリはGブレイバーバーストのバックエンドアプリです。
DBアクセス、業務ロジックをバックエンドアプリ間で共有するために、
本リポジトリには全バックエンドアプリのコードが含まれています。

##　アプリ一覧
以下が、本リポジトリに含まれているアプリの一覧です。
アプリ種別の詳細は [こちら](#アプリ種別について) をご確認ください。

|#|アプリ名|アプリ種別|概要| 
| --- | --- | --- | --- |
|1|WebSocket API|serverless型|ユーザリクエストの一時受付、各種通知を行うAPIサーバです |
|2|マッチメイクECS|常駐ECS型|定期的にDBをポーリングして、マッチメイクを行っています|

### アプリ種別について
#### serverless型
[serverless framework](https://github.com/serverless/serverless) で動作しているアプリ群です。

#### 常駐ECS型
[AWS Fargate](https://aws.amazon.com/jp/fargate/) で動作する常駐型アプリです。
ポーリング、バッチジョブなど、時間がかかる処理を担当しています。

## 前提条件
### monorepo セットアップ
[monorepoのセットアップ](../../Readme.md) が完了していること

### 必須ソフト
以下ソフトウェアがインストールされていること

* node.js
* npm
* serverless cli

### AWS関連
* AWSアカウントを所持していること
* [serverless cliのAWS認証](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) が完了していること
* マッチメイクECSが使うECRリポジトリが作成済みであること

## コマンド例
以降に掲載するコマンド例のカレントディレクトリは、
```<本リポジトリをcloneした場所>/packages/backend-app```であるとします。

### 全アプリ共有
#### セットアップ
```shell
cp .env.template .env
# 自分の環境に応じた値をセットする
vim .env
```

### WebSocket API
#### デプロイ
```shell
sls deploy
```

#### 動作確認
```shell
npm install -g wscat

# 以下URLを参考にAPI GatewayのURLを取得する
# https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-wscat.html 
API_URL=<AWS APIGatewayのURL>

# 以下URLを参考にauth0のアクセストークンを取得する
# https://auth0.com/docs/tokens/access-tokens/get-access-tokens
ACCESS_TOKEN=<auth0 access token>
wscat -c "$API_URL?token=$ACCESS_TOKEN"
{"action":"ping"}
-> サーバからメッセージが返される
```

### マッチメイクECS
#### ローカル環境での動作確認
```shell
npm run start:match-make
```

#### ビルド
```shell
npn run build:match-make
```