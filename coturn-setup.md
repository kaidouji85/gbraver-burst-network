# coturnセットアップ手順（さくらのVPS / Debian）

ローカルWebRTC接続を安定化するために、TURNサーバーとしてcoturnを構築する手順です。

## 1. IPv6有効化

2026/04/11現在、さくらのVPSはIPv6がデフォルトで無効化されています。
以下の公式ドキュメントの手順に従ってIPv6を有効化してください。

[IPv6有効化手順（Debian 12）](https://manual.sakura.ad.jp/vps/network/ipv6/debian-12.html)

## 2. サーバー初期化

VPSへSSH接続後、パッケージを最新化します。

```shell
sudo apt update
sudo apt upgrade -y
sudo apt install -y coturn
```

## 3. さくらのVPSパケットフィルターを設定

さくらのVPSコントロールパネル側で、以下を許可してください。

- SSH: `22/tcp`
- HTTP-01チャレンジ: `80/tcp`（証明書発行・更新時に使用）
- TURN: `3478/tcp`, `3478/udp`
- TURN(TLS): `5349/tcp`（TLSを使う場合）
- リレー用UDPポートレンジ: 例 `20000:20100/udp`

## 4. Route53でDNSレコードを設定

Route53ホストゾーン上で、coturnサーバー向けのサブドメインを作成します。
作成するレコードは以下の通りです。

| レコード名           | タイプ | 値                  |
| -------------------- | ------ | ------------------- |
| COTURN用サブドメイン | A      | VPSのグローバルIPv4 |
| COTURN用サブドメイン | AAAA   | VPSのグローバルIPv6 |

## 5. TLS証明書の取得（certbot + HTTP-01）

### 5-1. certbotをインストール

```shell
sudo apt install -y certbot acl
```

### 5-2. 証明書を取得（HTTP-01 / standalone）

`<TURN用ドメイン>`を実値に置き換えてください（例: `turn.example.com`）。

```shell
sudo certbot certonly \
  --standalone \
  --preferred-challenges http \
  -d <TURN用ドメイン> \
  --agree-tos \
  --email <メールアドレス>
```

成功すると証明書が以下に配置されます。

- 公開鍵: `/etc/letsencrypt/live/<TURN用ドメイン>/fullchain.pem`
- 秘密鍵: `/etc/letsencrypt/live/<TURN用ドメイン>/privkey.pem`

### 5-3. coturnへの証明書読み取り権限を付与

certbotが生成する証明書はデフォルトでroot管理です。`turnserver`ユーザーが辿って読めるように、ディレクトリには`rx`、証明書ファイルには`r`が付くようACLを設定します。

```shell
sudo setfacl -m u:turnserver:rx /etc/letsencrypt /etc/letsencrypt/live /etc/letsencrypt/archive
sudo setfacl -R -m u:turnserver:rx /etc/letsencrypt/live/<TURN用ドメイン>
sudo setfacl -R -m u:turnserver:rx /etc/letsencrypt/archive/<TURN用ドメイン>
```

設定後、`turnserver`ユーザーで読み取りテストを実施してください。

```shell
sudo -u turnserver test -r /etc/letsencrypt/live/<TURN用ドメイン>/fullchain.pem && echo ok_fullchain
sudo -u turnserver test -r /etc/letsencrypt/live/<TURN用ドメイン>/privkey.pem && echo ok_privkey
```

### 5-4. 証明書自動更新時にcoturnを再起動

Debianのcertbotは通常、systemd timerで自動更新されます。更新後にcoturnを再起動するフックを作成します。

```shell
sudo tee /etc/letsencrypt/renewal-hooks/deploy/coturn.sh > /dev/null <<'EOF'
#!/bin/sh
set -eu
setfacl -m u:turnserver:rx /etc/letsencrypt /etc/letsencrypt/live /etc/letsencrypt/archive
setfacl -R -m u:turnserver:rx /etc/letsencrypt/live/<TURN用ドメイン>
setfacl -R -m u:turnserver:rx /etc/letsencrypt/archive/<TURN用ドメイン>
systemctl restart coturn
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/coturn.sh
```

自動更新の疎通確認（dry-run）:

```shell
sudo certbot renew --dry-run
```

## 6. coturnを有効化

Debianでは`/etc/default/coturn`でサービス有効化します。

```shell
sudo sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn
```

## 7. turnserver.confを作成

`<VPSのグローバルIPv4>`、`<VPSのグローバルIPv6>`、`<TURN用ドメイン>`、`<強力な共通シークレット>`を実値に置き換えてください。
IPv6を使う場合は `ip -6 addr` で確認できる実アドレスを設定し、使わない場合は `listening-ip` と `relay-ip` のIPv6行を削除してください。

```shell
sudo cp /etc/turnserver.conf /etc/turnserver.conf.bak
sudo tee /etc/turnserver.conf > /dev/null <<'EOF'
# Listening
listening-port=3478
tls-listening-port=5349
listening-ip=<VPSのグローバルIPv4>
listening-ip=<VPSのグローバルIPv6>
relay-ip=<VPSのグローバルIPv4>
relay-ip=<VPSのグローバルIPv6>

# Relay port range (パケットフィルターでの指定と合わせる)
min-port=20000
max-port=20100

# TLS Certificates (Let's Encrypt)
cert=/etc/letsencrypt/live/<TURN用ドメイン>/fullchain.pem
pkey=/etc/letsencrypt/live/<TURN用ドメイン>/privkey.pem

# Auth
fingerprint
use-auth-secret
static-auth-secret=<強力な共通シークレット>
realm=gbraver.local

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

- `use-auth-secret`では、アプリサーバーとcoturnが同じ共通シークレットを持ち、アプリサーバー側で一時クレデンシャルを生成してクライアントへ渡します。

## 8. 起動と自動起動設定

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

## 9. 動作確認（Trickle ICE）

`use-auth-secret`の場合、先に一時クレデンシャルを生成します。

```shell
COTURN_SHARED_SECRET='<強力な共通シークレット>'
TURN_USERNAME="$(($(date +%s)+3600)):webrtc-user"
TURN_CREDENTIAL="$(printf '%s' "$TURN_USERNAME" | openssl dgst -binary -sha1 -hmac "$COTURN_SHARED_SECRET" | openssl base64)"

echo "$TURN_USERNAME"
echo "$TURN_CREDENTIAL"
```

`TURN_USERNAME`の先頭は有効期限UNIX時刻（例: 現在時刻 + 3600秒）です。

以下で接続テストできます。

- [Trickle ICE Sample](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)

各入力項目には、以下をセットしてください。

**ICE servers**

| STUN or TURN URI:                         | TURN username:  | TURN password:    |
| ----------------------------------------- | --------------- | ----------------- |
| turn:<TURN用ドメイン>:3478?transport=udp  | <TURN_USERNAME> | <TURN_CREDENTIAL> |
| turn:<TURN用ドメイン>:3478?transport=tcp  | <TURN_USERNAME> | <TURN_CREDENTIAL> |
| turns:<TURN用ドメイン>:5349?transport=tcp | <TURN_USERNAME> | <TURN_CREDENTIAL> |

**ICE options**

- `all`を選択
- `Acquire microphone/camera permissions`はチェックを外す

入力が完了したら、`Gather candidates`をクリックしてください。
`Type`が`relay`のレコードが含まれていれば、TURNサーバー経由での接続が成功しています。

## 10. SDK利用時の設定例

アプリケーション側で`RTCPeerConnection`に渡す`iceServers`へ、サーバーが生成した一時クレデンシャルを設定してください。

```ts
const turnUsername = "<TURN_USERNAME>";
const turnCredential = "<TURN_CREDENTIAL>";

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        "turn:<VPSのグローバルIP>:3478?transport=udp",
        "turn:<VPSのグローバルIP>:3478?transport=tcp",
      ],
      username: turnUsername,
      credential: turnCredential,
    },
  ],
});
```

## 11. 運用上の注意

- 共通シークレットは十分に長いランダム値を使用し、定期的に更新してください。
- 必要であればfail2ban導入や接続元IP制限を検討してください。
- 帯域コストを抑えるため、リレー用ポートレンジは必要最小限にしてください。
- さくらのVPSパケットフィルター制約により、リレーポートは`1-32767`の範囲で設計してください。
- 一時クレデンシャルのTTLは短め（例: 10分から1時間）にしてください。
