# VPC設定

本リポジトリは、GブレイバーバーストのVPC用CDKスタックです。
NAT Gatewayの料金を節約するために、開発、本番環境で同一のVPCを利用しています。
## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```<本リポジトリをcloneした場所>/packages/aws-vpc```であるとします。
## 前提条件
プロジェクトルートに記載されている[前提条件](../../Readme.md#pre-required)をクリアしてください。

## 環境変数定義
```shell
cp .env.template .env
# 環境に応じた値を設定する
vim .env
```

## ユニットテスト
```shell
# テスト実行
npm test

# スナップショット更新
npx jest -u
```

<a id="deploy-command"></a>
## VPCをデプロイする
```shell
npx cdk deploy
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
