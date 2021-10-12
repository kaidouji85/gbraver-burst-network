# GブレイバーバーストブラウザSDK

## はじめに
GブレイバーバーストのブラウザSDKです。
本リポジトリは、バックエンドがserverless frameworkの場合のブラウザSDK実装になります。

## 前提条件
### monorepo セットアップ
[monorepoのセットアップ](../../Readme.md) が完了していること

### 必須ソフト
以下ソフトがインストールされていること

* node.js
* npm

## コマンド例
以降に掲載するコマンド例のカレントディレクトリは、
```<本リポジトリをcloneした場所>/packages/browser-cdk```であるとします。

### ビルド
```shell
# 通常ビルド
npm run build
```