# VPC設定

本リポジトリはGブレイバーバーストで利用するVPC設定です。
NAT Gatewayの料金を節約するために、開発、本番環境で同一のVPCを利用することを想定しています。

## 前提条件
### monorepo セットアップ
[monorepoのセットアップ](../../Readme.md) が完了していること

### 必須ソフト
以下ソフトウェアがインストールされていること
* node.js
* npm

### AWS
* 有効なAWSアカウントを所持していること
* [aws cliの認証設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html) が完了していること

## コマンド例
以降に掲載するコマンド例のカレントディレクトリは、
```<本リポジトリをcloneした場所>/packages/aws-vpc```であるとします。

### デプロイ
```shell
npm run deploy
```