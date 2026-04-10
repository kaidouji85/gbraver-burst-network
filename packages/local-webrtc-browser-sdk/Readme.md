# Gブレイバーバースト ローカルWebRTCブラウザSDK

## はじめに

本リポジトリは、GブレイバーバーストのローカルWebRTCブラウザSDKです。

## コマンド例のカレントディレクトリについて

とくに断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/local-webrtc-browser-sdk`であるとします。

## 前提条件

プロジェクトルートに記載されている[事前作業](../../Readme.md#事前作業)を完了させてください。

## coturnセットアップ手順（さくらのVPS / Debian）

ローカルWebRTC接続を安定化するために、TURNサーバーとしてcoturnを構築する手順です。

### 1. サーバー初期化

VPSへSSH接続後、パッケージを最新化します。

```shell
sudo apt update
sudo apt upgrade -y
sudo apt install -y coturn ufw
```

### 2. ファイアウォールを開放

最低限、以下を開放します。

- SSH: `22/tcp`
- TURN: `3478/tcp`, `3478/udp`
- TURN(TLS): `5349/tcp`（TLSを使う場合）
- リレー用UDPポートレンジ: 例 `49160:49200/udp`

```shell
sudo ufw allow 22/tcp
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 49160:49200/udp
sudo ufw enable
sudo ufw status verbose
```

### 3. coturnを有効化

Debianでは`/etc/default/coturn`でサービス有効化します。

```shell
sudo sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn
```

### 4. turnserver.confを作成

`<VPSのグローバルIP>`と`<強力なパスワード>`を実値に置き換えてください。

```shell
sudo cp /etc/turnserver.conf /etc/turnserver.conf.bak
sudo tee /etc/turnserver.conf > /dev/null <<'EOF'
# Listening
listening-port=3478
tls-listening-port=5349
listening-ip=<VPSのグローバルIP>
relay-ip=<VPSのグローバルIP>

# Relay port range (firewallと合わせる)
min-port=49160
max-port=49200

# Auth
fingerprint
lt-cred-mech
realm=gbraver.local
user=webrtc:<強力なパスワード>

# Recommended
stale-nonce=600
no-multicast-peers
no-cli

# Logging
simple-log
log-file=/var/log/turnserver/turn.log
EOF
```

補足:

- VPSがNAT配下の場合は`external-ip=<グローバルIP>/<プライベートIP>`を使用してください。
- ドメインと証明書を用意できる場合は`cert=`と`pkey=`を設定し、`turns:`を利用してください。

### 5. 起動と自動起動設定

```shell
sudo mkdir -p /var/log/turnserver
sudo chown turnserver:turnserver /var/log/turnserver
sudo systemctl enable coturn
sudo systemctl restart coturn
sudo systemctl status coturn --no-pager
```

待受確認:

```shell
sudo ss -lntup | grep -E '3478|5349|turn'
```

### 6. 動作確認（Trickle ICE）

以下で接続テストできます。

- [Trickle ICE Sample](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)

ICE server例:

```json
{
  "urls": ["turn:<VPSのグローバルIP>:3478?transport=udp", "turn:<VPSのグローバルIP>:3478?transport=tcp"],
  "username": "webrtc",
  "credential": "<強力なパスワード>"
}
```

TLSを使う場合の例:

```json
{
  "urls": ["turns:<TURN用ドメイン>:5349?transport=tcp"],
  "username": "webrtc",
  "credential": "<強力なパスワード>"
}
```

`relay`候補が取得できればTURN経由通信は概ね正常です。

### 7. SDK利用時の設定例

アプリケーション側で`RTCPeerConnection`に渡す`iceServers`へ上記TURN情報を設定してください。

```ts
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        'turn:<VPSのグローバルIP>:3478?transport=udp',
        'turn:<VPSのグローバルIP>:3478?transport=tcp',
      ],
      username: 'webrtc',
      credential: '<強力なパスワード>',
    },
  ],
});
```

### 8. 運用上の注意

- パスワードは十分に長いランダム値を使用し、定期的に更新してください。
- 必要であればfail2ban導入や接続元IP制限を検討してください。
- 帯域コストを抑えるため、リレー用ポートレンジは必要最小限にしてください。

## ビルド

```shell
npm run build
```

## 脆弱性チェック

```shell
npm audit --omit=dev
```

## package.jsonフォーマット

```shell
# 本コマンドの実行にはfixpackが必要
# https://www.npmjs.com/package/fixpack
fixpack
```

## License

MIT
