# VPC設定

本リポジトリはGブレイバーバーストで利用するVPC設定です。
NAT Gatewayの料金を節約するために、開発、本番環境で同一のVPCを利用することを想定しています。

## 前提条件
### 必須ソフト
以下ソフトウェアがインストールされていること

* node.js
* npm

### AWS認証設定
aws cliの認証設定が完了していること
https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html

## 動かし方
### セットアップ
```shell
cd <本リポジトリをcloneした場所>/packages/aws-vpc
npm ci
```

### デプロイ
```shell
cd <本リポジトリをcloneした場所>/packages/aws-vpc
npm run deploy
```