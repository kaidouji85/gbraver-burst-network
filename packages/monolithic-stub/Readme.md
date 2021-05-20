# モノシリックサーバ クライアントSDK スタブ

## 動かし方
### 前提
「[clone直後にやること](../../Readme.md)」を予め実行してください。

### コマンド
#### 1. 設定ファイルの記載
この手順は初回起動時にだけ実施すれば大丈夫です。

```shell
cd <本リポジトリをcloneした場所>/packages/monolithic-stub
cp .env.template .env

# .envをテキストエディタで編集して
# 環境に応じた値をセットする
vi .env
```

#### 2. スタブ起動
```shell
cd <本リポジトリをcloneした場所>
npx lerna run --scope @gbraver-burst-network/monolithic-server start
npx lerna run --scope @gbraver-burst-network/monolithic-stub start

# ブラウザでlocalhost:8080を開く
```