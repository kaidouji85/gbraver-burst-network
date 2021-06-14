# モノリシックサーバ

Gブレイバーバーストのモノリシック構造のサーバです。

## 動かし方
### 前提
「[clone直後にやること](../../Readme.md)」を予め実行してください。

### コマンド
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
npx lerna run --scope @gbraver-burst-network/monolithic-server start
```

## tips

### sha256ハッシュの作り方

```shell
echo -n '任意のパスワード' | shasum -a 256
# コマンドラインにハッシュ化されたパスワードが表示される
```