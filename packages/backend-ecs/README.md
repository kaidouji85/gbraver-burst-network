# バックエンドECS
本リポジトリはバックエンド処理ECSのCDKスタックです。

## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```<本リポジトリをcloneした場所>/packages/backend-ecs```であるとします。

## 前提条件
プロジェクトルートに記載されている[前提条件](../../Readme.md#pre-required)をクリアした上で、
以下作業を実施してください。

### .env生成
```shell
# .envに環境に応じた値をセットする
cp .env.template .env
vim .env
```

## デプロイ方法
```shell
npx cdk deploy
```

## ユニットテスト
```shell
# ユニットテスト実行
npm test

# スナップショット
npx jest -u
```
