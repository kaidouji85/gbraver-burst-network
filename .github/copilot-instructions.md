## 共通設定

- 日本語で回答してください

## プロジェクト構成

- このプロジェクトはモノレポ構成です
- 各パッケージはpackagesディレクトリ配下に配置されています
- 各パッケージは独立したpackage.jsonと各種設定ファイルを持ちます

## コーディング規約

### プロダクトコード規約

- 各パッケージ内のソースコードはsrcディレクトリに配置してください
  - 例: `packages/backend-app/src/`、`packages/browser-sdk/src/`
- ソースコードのlintはeslintを使用し、prettierでフォーマットしてください

### テストコード規約

- ユニットテストにはjestを使用してください
- 各パッケージ内のユニットテストはtestディレクトリに配置し、srcディレクトリの構造と同じ階層構造にしてください
  - 例: `packages/backend-app/test/`、`packages/browser-sdk/test/`
- テストコードではdescribeブロックを使わず、test関数をトップレベルで宣言してください
