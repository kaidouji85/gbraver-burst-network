# オフライン用スタブ

オフライン環境のスタブです。
サーバーは[offline-backend-app](../offline-backend-app/Readme.md)、ブラウザSDKは[offline-browser-sdk](../offline-browser-sdk/Readme.md)を使っています。

## セットアップ

```bash
npm ci

# .envに各種設定を記載
cp .env.template .env
```

## 起動方法

サーバーを起動する。
詳細は[offline-backend-app](../offline-backend-app/Readme.md)を参照。
その上で、以下コマンドを実行する。

```bash
# デフォルトだとhttp://localhost:8080で起動
npm start
```
