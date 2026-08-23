# GitHub Actions CI環境構築方法

本書ではGitHub Actionsを利用したCI/CD環境の構築方法を説明する。

## 事前作業

- serverless dashboardにサインインし、[このページ](https://app.serverless.com/settings/accessKeys)からaccesskeyを生成する
- AWSで「SlsCli用IAMポリシー」をアタッチしたIAMユーザーを作成し、アクセスキーIDとシークレットキーを控えておく

**SlsCli用IAMポリシー**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudformation:DescribeStackResource",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

## Secrets設定

[ここ](https://docs.github.com/ja/actions/security-guides/using-secrets-in-github-actions)を参考にGitHub
ActionsのSecretsを設定する。
以下が設定内容である。

| シークレット名        | 値                                        |
| --------------------- | ----------------------------------------- |
| SERVERLESS_ACCESS_KEY | serverless dashboardから発行したaccesskey |
| AWS_ACCESS_KEY_ID     | AWS IMAユーザー アクセスキーID            |
| AWS_SECRET_ACCESS_KEY | AWS IMAユーザー シークレットキー          |
