# バックエンドECS

本リポジトリはバックエンド処理用ECSのCDKスタックです。

## 前提条件

### 必須ソフト
以下ソフトがインストールされていること

* node.js
* npm
* Docker

### AWS認証設定
aws cliの認証設定が完了していること
https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html

### AWSリソース
以下モジュールに定義されているAWSリソースがデプロイされていること。

* @gbraver-burst-network/aws-vpc
* @gbraver-burst-network/serverless

## 動かし方
### セットアップ

```shell
cd <本リポジトリをcloneした場所>/backend-ecs
npm ci
cp .env.template .env
# 環境に応じた値をセットする
vim .env
```

### デプロイ

```shell
cd <本リポジトリをcloneした場所>/backend-ecs
npm run deploy
```
