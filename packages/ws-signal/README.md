# WebSocket製シグナリングサーバー

本リポジトリはWebSocket製シグナリングサーバーである。

## コマンド例のカレントディレクトリについて

とくに断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/ws-signal`であるとする。

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
