# Gブレイバーバースト ネットワーク

Gブレイバーバーストのネットワーク関連モジュールを集めたものです。
本リポジトリの構造は、標準的な[lerna monorepo](https://lerna.js.org) です。

## セットアップ
本リポジトリをcloneした直後に、以下コマンドを実行してください。
以下コマンドを実行しない場合、内部パッケージの依存関係が解決できないため、
各パッケージ配下に用意されたコマンドが正常動作しない恐れがあります。

```shell
cd <本リポジトリをcloneした場所>
npm ci
npm run bootstrap
npm run build
```

## 環境構築方法
Gブレイバーバーストのバックエンドは様々なモジュールが複雑に絡みあっています。
以下に、環境構築をする順番を記載します。

### 1. VPCの作成
[ここ](./packages/aws-vpc/README.md) を参考にVPCを作成します。

### 2. serverlessデプロイ
[serverless.buildspec.yml](./serverless.buildspec.yml) を参考に、serverless frameworkで構成されたAPIサーバをデプロイします。

### 3. ECRリポジトリPush
[matchMakeContainer.buildspec.yml](./matchMakeContainer.buildspec.yml) を参考に、ECRリポジトリにPushします。

### 4. バックエンドECSデプロイ
[backendEcs.buildspec.yml](./backendEcs.buildspec.yml) を参考に、バックエンドECSをデプロイします。