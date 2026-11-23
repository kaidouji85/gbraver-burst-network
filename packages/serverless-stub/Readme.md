# GブレイバーバーストAPIサーバスタブ

本リポジトリはGブレイバーバーストのAPIサーバ動作確認用スタブです。

## 前提条件

### monorepo セットアップ

[monorepoのセットアップ](../../Readme.md) が完了していること

### 必須ソフト

以下ソフトがインストールされていること

- node.js
- npm

## コマンド例

以降に掲載するコマンド例のカレントディレクトリは、
`<本リポジトリをcloneした場所>/packages/serverless`であるとします。

### セットアップ

```shell
cp .env.template .env
# 環境に応じた値をセットする
vi .env
```

### ビルド

```shell
npm run build
```

### スタブ起動

```shell
npm run start
```

### バトル進行ヘルパー

CPUごとのバトル進行関数と選択するアームドーザ・パイロットの定数は、
`src/use-case/execute-battle/` にあります。
プレイヤー01は `executePlayer01Battle`、`PLAYER_01_ARMDOZER`、`PLAYER_01_PILOT`、
プレイヤー02は `executePlayer02Battle`、`PLAYER_02_ARMDOZER`、`PLAYER_02_PILOT` を使用します。

### 脆弱性チェック

```shell
npm audit --omit=dev
```

### package.jsonフォーマット

```shell
# 本コマンドの実行にはfixpackが必要
# https://www.npmjs.com/package/fixpack
fixpack
```

## License

MIT
