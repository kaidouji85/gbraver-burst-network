# モノリシックサーバ

Gブレイバーバーストのモノリシック構造のサーバです。

## 動かし方
### 前提
「[clone直後にやること](../../Readme.md)」を予め実行している

### ローカル環境
#### 1. 設定ファイルの記載
この手順は初回起動時にだけ実施すれば大丈夫です。

```shell
cd <本リポジトリをcloneした場所>/packages/monolithic-server
cp .env.template .env
cp users.json.template users.json

# .envをテキストエディタで編集して
# 環境に応じた値をセットする
vi .env
```
#### 2. サーバ起動

```shell
cd <本リポジトリをcloneした場所>
npm run start:monolithic-server
```

### 本番環境

#### 1. mongodbの構築
以下を参考にユーザデータを作成してください

```shell
mongo <mongo接続文字列>

use <利用するDB名>
# 追加するユーザだけ以下コマンドを繰り返す
db.users.insert({userID: 'ユーザ名', password: 'sha256でハッシュ化されたパスワード'})
```

#### 2. 環境変数の設定
この手順は初回起動時にだけ実施すれば大丈夫です。

```shell
export NODE_ENV=production

# .env.templateに記載されている環境変数に、環境に応じた値をセットする
```

#### 3. サーバ起動
```shell
cd cd <本リポジトリをcloneした場所>
npm run start:monolithic-server-production
```

## tips

### sha256ハッシュの作り方

```shell
echo -n '任意のパスワード' | shasum -a 256
# コマンドラインにハッシュ化されたパスワードが表示される
```