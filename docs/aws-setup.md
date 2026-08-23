# AWS環境セットアップマニュアル

本書では、AWS環境のセットアップ方法を説明する。

## 1. VPC作成

[ここ](../packages/aws-vpc/README.md#deploy-command)を参考に、VPCを作成する。

## 2. マッチメイク用ECRリポジトリ作成

AWSでマッチメイク用ECRリポジトリを作成する。

## 3. Docker Hubアクセストークン発行

[ここ](https://docs.docker.com/docker-hub/access-tokens/)を参考に、Docker Hubのアクセストークンを発行する。

## 4. API GatewayがCloud Watch Logsに書き込むためのIAM Roleを作成

以下を参考に、API GatewayがCloud Watch Logsに書き込むためのIAM Roleを作成する。
Role名は「serverlessApiGatewayCloudWatchRole」とすること。

https://dev.classmethod.jp/articles/tsnote-apigw-what-to-do-when-cloudwatch-logs-role-arn-must-be-set-in-account-settings-to-enable-logging-occurs-with-api-gateway/

## 5. Cognitoユーザープールの作成

Cognitoのユーザープールを以下条件で作成する。

- CognitoユーザープールのサインインオプションはEメールに設定する **(後から変更できない)**
- Hosted UIを有効にする
  - スコープにopenid, email, profile、phone、aws.cognito.signin.user.adminを追加する
- 許可されているコールバックURL、許可されているサインアウトURLにGブレイバーバーストをホストしているURLを設定する
- 検証メッセージの検証タイプを`Link`に設定する

> [!NOTE]
> 開発環境は開発効率を優先して、許可されているコールバックURL、許可されているサインアウトURLに`http://localhost:8080`を設定することを推奨する。

## 6. CognitoにGoogleのソーシャルログインを追加

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

CognitoのホストされたUIのID プロバイダーにGoogleを追加する。

## 7. 各種ドメイン名の準備

### 7.1. APIサーバー用のドメイン名およびACM証明書の準備

APIサーバー用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はAPIサーバー用のドメイン名のワイルドカード証明書である必要がある。

例

- APIサーバー用のドメイン名: ws-api.example.com
- ACM証明書: \*.ws-api.example.com

### 7.2. シグナルサーバー用のドメイン名およびACM証明書の準備

シグナルサーバー用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はシグナルサーバー用のドメイン名のワイルドカード証明書である必要がある。

例

- シグナルサーバー用のドメイン名: ws-signal.example.com
- ACM証明書: \*.ws-signal.example.com

### 7.3. バックエンドCloudFront用のドメイン名およびACM証明書の準備

バックエンドCloudFront用のドメイン名をRoute53で準備し、ACMでSSL証明書を発行する。
ACM証明書はバックエンドCloudFront用のドメイン名のワイルドカード証明書である必要がある。

例

- バックエンドCloudFront用のドメイン名: backend.example.com
- ACM証明書: \*.backend.example.com

## 8. CloudFrontのデプロイ

[ここ](../packages/cloudfront/README.md#各種手順)を参考に、CloudFrontをデプロイする。
