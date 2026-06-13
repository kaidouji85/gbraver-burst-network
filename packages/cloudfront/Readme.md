# CloudFront

本リポジトリはCloudFrontを管理するCloudFormationテンプレートを提供します。

## あらかじめ作成しておくべきリソース

- CloudFrontのドメイン名（Route53のホストゾーン）
- CloudFrontのSSL証明書（us-east-1リージョンで作成したACM）
- [ws-signal](../ws-signal)でデプロイしCloudFormationスタック

## 各種手順

本CloudFormationテンプレートでは従量課金形式のCloudFrontを構築します。
2026/06/13現在、定額プランのCloudFrontはCloudFormationで構築できないため、

1. CloudFormationで従量課金形式のCloudFrontを構築
2. 1で作成したCloudfrontをAWSマネジメントコンソールで定額プランに変更
3. 2にはAWS WAFが自動的に適用されるので、CloudFormationテンプレートにもそれを適用する

という手順を踏む必要があります。

```bash
# 初回リリース
# パラメーターWebACLArnを指定しないでリリース
aws cloudformation deploy \
  --template-file gb-backend-cloudfront.yaml \
  --stack-name ${STACK_NAME} \
  --region ${AWS_DEFAULT_REGION} \
  --parameter-overrides \
  WebRTCHelperDomainName=${WEB_RTC_HELPER_DOMAIN_NAME} \
  DistributionAlias=${BACKEND_CLOUDFRONT_DOMAIN_NAME} \
  AcmCertificateArn=${BACKEND_CLOUDFRONT_CERT_ARN} \
  --no-fail-on-empty-changeset

# 必要に応じてマネコンからCloudFrontを定額プランに変更
# 定額プランで追加されたWeb ACLのARNをメモしておく

# 2回目以降のリリース
# パラメーターにWebACLArnを追加してリリース
aws cloudformation deploy \
  --template-file gb-backend-cloudfront.yaml \
  --stack-name ${STACK_NAME} \
  --region ${AWS_DEFAULT_REGION:?} \
  --parameter-overrides \
  WebRTCHelperDomainName=${WEB_RTC_HELPER_DOMAIN_NAME} \
  DistributionAlias=${BACKEND_CLOUDFRONT_DOMAIN_NAME:?} \
  AcmCertificateArn=${BACKEND_CLOUDFRONT_CERT_ARN:?} \
  WebACLArn=${BACKEND_CLOUDFRONT_WEB_ACL_ARN:?} \
  --no-fail-on-empty-changeset
```
