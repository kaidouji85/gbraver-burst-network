# WebSocket製シグナリングサーバー

本リポジトリはWebSocket製シグナリングサーバーである。

## コマンド例のカレントディレクトリについて

とくに断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/ws-signal`であるとする。

## 前提条件

プロジェクトルートに記載されている[事前作業](../../Readme.md#事前作業)を完了させておくこと。

## 各種コマンド

### 型チェック

```shell
npm run type-check
```

### デプロイ

```shell
npx sls deploy --stage <ステージ名>
```

### 環境破棄

```shell
npx sls remove --stage <ステージ名>
```

### WebSocketAPI 動作確認

```shell
npm install -g wscat

# 以下URLを参考にAPI GatewayのURLを取得する
# https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-wscat.html
API_URL=<AWS APIGatewayのURL>

wscat -c "$API_URL"
{"action":"ping"}
-> サーバからメッセージが返される
```
