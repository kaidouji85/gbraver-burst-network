# バックエンドECS
本リポジトリはバックエンド処理ECSのCDKスタックです。

## 前提条件
### monorepo セットアップ
[monorepoのセットアップ](../../Readme.md) が完了していること

### VPC
[@gbraver-burst-network/aws-vpc](../aws-vpc/README.md) にてVPCが生成されていること

### Serverless
[@gbraver-burst-network/backend-app/serverless.yml](../backend-app/serverless.yml)
で定義されたserverlessアプリがデプロイされていること

### 必須ソフト
以下ソフトがインストールされていること

* node.js
* npm

### AWS
* 有効なAWSアカウントを所持していること
* [aws cliの認証設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html) が完了していること

## コマンド例
以降に掲載するコマンド例のカレントディレクトリは、
```<本リポジトリをcloneした場所>/packages/backend-ecs```であるとします。

### セットアップ
```shell
cp .env.template .env
# 環境に応じた値をセットする
vim .env
```

### デプロイ
```shell
npx cdk deploy
```
