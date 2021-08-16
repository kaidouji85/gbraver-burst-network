# Gブレイバーバースト サーバサイド(serverless)

## はじめに
Gブレイバーバーストのサーバサイド実装です。
serverless frameworkを使っています。

## 前提条件
### 必須ソフト
以下ソフトウェアがインストールされていること

* node.js
* npm
* serverless cli

### AWS認証設定
serverless cliのAWS認証が完了していること

https://www.serverless.com/framework/docs/providers/aws/guide/credentials/

## セットアップ

```shell
cd <本リポジトリをcloneした場所>
npm ci
cp .env.template .env
```

## デプロイ

```shell
cd <本リポジトリをcloneした場所>
sls deploy
```

## 動作確認

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