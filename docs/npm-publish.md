# npm publishマニュアル

本書では、npmパッケージを公開する手順を説明する。

## 通常版

```shell
# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version
npm install

npm run build
npx changeset publish
```

## β版

```shell
# β版モード開始
npx changeset pre enter beta

# 画面の指示に従い、変更内容を記入する
npx changeset
npx changeset version
npm install

npm run build
npx changeset publish

# β版モード終了
npx changeset pre exit
```
