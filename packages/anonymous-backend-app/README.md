# 匿名バックエンド

本リポジトリは匿名バックエンドである。

## コマンド例のカレントディレクトリについて

とくに断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/anonymous-backend-app`であるとする。

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

### 動作確認

#### スモークテスト

```shell
STAGE=<ステージ名>

# 匿名トークンを発行する（以降のコマンド例ではこのトークンを使用する）
REST_API_DOMAIN=<WebRTC ヘルパーAPIのドメイン名>
curl -X POST "https://${REST_API_DOMAIN}/${STAGE}/auth-token"

AUTH_TOKEN=<発行された認証トークン>

# coturn用の認証トークンを発行する
curl -X POST -H "Authorization: Bearer $AUTH_TOKEN" "https://${REST_API_DOMAIN}/${STAGE}/coturn/credentials"

# 事前にnanoidをインストールしておく
npm install -g nanoid

# フロントエンド用ログ
SPAN_ID=$(nanoid)
curl -X POST \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"spanId\": \"${SPAN_ID}\", \"type\": \"SIGNALING_START\"}" \
  "https://${REST_API_DOMAIN}/${STAGE}/frontend-log"

# 事前にwscatをインストールしておく
npm install -g wscat

# 以下URLを参考にAPI GatewayのURLを取得する
# https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-wscat.html
WS_API_DOMAIN=<WebSocket APIのドメイン名>

wscat -c "wss://${WS_API_DOMAIN}?token=${AUTH_TOKEN}"
{"action":"ping"}
-> サーバからメッセージが返される
```

#### シグナリング

##### ホスト

```bash
# 接続先をセット
STAGE=<ステージ名>
REST_API_DOMAIN=<WebRTC ヘルパーAPIのドメイン名>
WS_API_DOMAIN=<WebSocket APIのドメイン名>

# 匿名トークンを発行する（以降のコマンド例ではこのトークンを使用する）
curl -X POST "https://${REST_API_DOMAIN}/${STAGE}/auth-token"
AUTH_TOKEN=<発行された認証トークン>

# websocketに接続する
wscat -c "wss://${WS_API_DOMAIN}?token=${AUTH_TOKEN}"

{"action":"create-room"}
-> サーバからルームIDが返されるので、ゲストに伝える
-> ゲストとマッチングしたらシグナリングIDが返される（以降はこれを使用する）

{"action":"send-sdp","sdp":{"type":"offer","sdp":"DUMMY_HOST_SDP"},"signalingID":"<シグナリングID>"}
-> ゲストにSDPが送信される

{"action":"send-ice-candidate","iceCandidate":{"candidate":"candidate:1 1 UDP 2122260223 192.0.2.1 54321 typ host","sdpMid":"0","sdpMLineIndex":0,"usernameFragment":"DUMMY_HOST_ICE"},"signalingID":"<シグナリングID>"}
-> ゲストにホスト側のICE Candidateが送信される

{"action":"delete-signaling-channel","signalingID":"<シグナリングID>"}
-> シグナリングチャネル破棄
-> 以降はSDP、ICE Candidateの送受信はできなくなる
```

##### ゲスト

```bash
STAGE=<ステージ名>
REST_API_DOMAIN=<WebRTC ヘルパーAPIのドメイン名>
WS_API_DOMAIN=<WebSocket APIのドメイン名>

# 匿名トークンを発行する（以降のコマンド例ではこのトークンを使用する）
curl -X POST "https://${REST_API_DOMAIN}/${STAGE}/auth-token"
AUTH_TOKEN=<発行された認証トークン>

# websocketに接続する
wscat -c "wss://${WS_API_DOMAIN}?token=${AUTH_TOKEN}"

{"action":"join-room","roomID":"<ホストから伝えられたルームID>"}
-> マッチングしたらシグナリングIDが返される（以降はこれを使用する）

{"action":"send-sdp","sdp":{"type":"answer","sdp":"DUMMY_GUEST_SDP"},"signalingID":"<シグナリングID>"}
-> ホストにSDPが送信される

{"action":"send-ice-candidate","iceCandidate":{"candidate":"candidate:2 1 UDP 2122260222 192.0.2.2 54322 typ host","sdpMid":"0","sdpMLineIndex":0,"usernameFragment":"DUMMY_GUEST_ICE"},"signalingID":"<シグナリングID>"}
-> ホストにゲスト側のICE Candidateが送信される
```
