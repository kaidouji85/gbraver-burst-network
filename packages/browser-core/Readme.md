# Gブレイバーバースト ブラウザ コア

GブレイバーバーストのブラウザSDKのインタフェースです。
バックエンドがどのような実装でも、
ブラウザ側のインタフェースに変更が生じることは稀だという想定で
抽象レイヤーを独立したパッケージにしました。

## 前提条件
### monorepo セットアップ
[monorepoのセットアップ](../../Readme.md) が完了していること

### 必須ソフト
以下ソフトがインストールされていること

* node.js
* npm

## コマンド例
以降に掲載するコマンド例のカレントディレクトリは、
```<本リポジトリをcloneした場所>/packages/browser-core```であるとします。

### ビルド
```shell
npm run build
```