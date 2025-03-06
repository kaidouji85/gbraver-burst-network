# GブレイバーバーストブラウザSDK

## はじめに

本リポジトリは、GブレイバーバーストのブラウザSDKです。

## コマンド例のカレントディレクトリについて

特に断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/browser-sdk`であるとします。

## 前提条件

プロジェクトルートに記載されている[前提条件](../../Readme.md#pre-required)をクリアしてください。

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

#License
MIT
