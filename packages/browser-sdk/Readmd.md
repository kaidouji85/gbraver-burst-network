# sls-chat-client

## はじめに

この[リポジトリ](https://github.com/kaidouji85/sls-chat) で作ったチャットシステムのクライアントにです。

## 前提条件

* node.js(v16.6.1以上)がインストールされている
* npm(7.20.3以上)がインストールされている
* auth0の同一テナント上にアプリケーション、APIを作成する
  * https://auth0.com/docs/architecture-scenarios/spa-api/part-2#create-the-api
  * https://auth0.com/docs/architecture-scenarios/spa-api/part-2#create-the-application
* auth0アプリケーションの以下設定に「http://localhost:8080」を追加すること
  * Allowed Callback URLs
  * Allowed Logout URLs
  * Allowed Web Origins

## セットアップ

```shell
cd <本リポジトリをcloneした場所>
cp .env.template .env
# .envに環境に応じた値をセットする
vim .env
npm ci
```

## 動かし方

```shell
cd <本リポジトリをcloneした場所>
npm start
# ブラウザでhttp://localhost:8080を開く
```