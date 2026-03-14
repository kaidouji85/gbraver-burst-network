# Gブレイバーバースト ローカルWebRTCブラウザSDK

## はじめに

本リポジトリは、GブレイバーバーストのローカルWebRTCブラウザSDKです。

## コマンド例のカレントディレクトリについて

特に断りがない限り、本書のコマンド例のカレントディレクトリは`<本リポジトリをcloneした場所>/packages/local-webrtc-browser-sdk`であるとします。

## 前提条件

プロジェクトルートに記載されている[事前作業](../../Readme.md#事前作業)を完了させてください。

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

# License

MIT
