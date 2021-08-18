# GブレイバーバーストブラウザSDK

## はじめに
GブレイバーバーストのブラウザSDKです

## ビルド方法
### 前提
「[clone直後にやること](../../Readme.md)」を予め実行している

## ビルドコマンド

```shell
# 通常ビルド
cd <本リポジトリのルート>
npm run build:browser-sdk
# or
cd <本リポジトリのルート>/packages/browser-sdk/
npm run build

# フルビルド
cd <本リポジトリのルート>
npm run clean
npm run build:core
npm run build:browser-sdk
```