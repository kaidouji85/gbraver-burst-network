# ブラウザSDK スタブ

## 動かし方
### 前提
「[clone直後にやること](../../Readme.md)」を予め実行してください。

### コマンド
#### 1. 設定ファイルの記載
この手順は初回起動時にだけ実施すれば大丈夫です。

```shell
cd <本リポジトリをcloneした場所>/packages/serverless-stub
cp .env.template .env

# .envをテキストエディタで編集して
# 環境に応じた値をセットする
vi .env
```

#### 2. ビルド

```shell
# 通常ビルド
cd <本リポジトリをcloneした場所>
npm run build:serverless-stub
# or
cd <本リポジトリをcloneした場所>/packages/serverless-stub 
npm run build

# フルビルド
cd <本リポジトリをcloneした場所>
npm run build:core
npm run build:browser-sdk
npm run build:serverless-stub
```
#### 3. スタブ起動
```shell
# 通常起動
# 事前にビルドをする必要がある
cd <本リポジトリをcloneした場所>
npm run serve:serverless-stub
# ブラウザでlocalhost:8080を開く

# ビルドも含めての起動
cd cd <本リポジトリをcloneした場所>
npm run start:serverless-stub
```