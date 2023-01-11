# Gブレイバーバースト ブラウザ コア

GブレイバーバーストのブラウザSDKのインタフェースです。
バックエンドがどのような実装でも、
ブラウザ側のインタフェースに変更が生じることは稀だという想定で、
抽象レイヤーを独立したパッケージにしました。

## コマンド例のカレントディレクトリについて
特に断りがない限り、本書のコマンド例のカレントディレクトリは```<本リポジトリをcloneした場所>/packages/browser-core```であるとします。

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
