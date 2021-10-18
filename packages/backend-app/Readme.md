# Gブレイバーバースト バックエンド アプリ

本リポジトリはGブレイバーバーストのバックエンドアプリです。
DBアクセス、業務ロジックをバックエンドアプリ間で共有するために、 全バックエンドアプリのコードが含まれています。

## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```<本リポジトリをcloneした場所>/packages/backend-app```であるとします。

## 前提条件
プロジェクトルートに記載されている[前提条件](../../Readme.md#pre-required)をクリアした上で、
以下作業を実施してください。

### .env生成
```shell
cp .env.template .env
```

## アプリ一覧
以下が本リポジトリのアプリ一覧です。
アプリ種別については、 [こちら](#アプリ種別について) をご確認ください。

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

## 各種コマンド
### WebSocket API
#### デプロイ
```shell
# sls deploy実行時に必要な環境変数を記載する
vim .env
npx sls deploy
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
# sls deployで動的生成した値、同コマンドの実行状況の環境変数を記載する
vim .env
npm run start:match-make
```

#### ビルド
```shell
npm run build:match-make
```