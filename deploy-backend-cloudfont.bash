#!/bin/bash
set -Ceu

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}"/packages/cloudfront || exit

STACK_NAME="${BACKEND_CLOUDFRONT_SERVICE:?}-g1"
EXPORT_NAME_OF_WEB_RTC_HELPER_DOMAIN_NAME="${WS_SIGNAL_SERVICE:?}:${STAGE:?}:HttpApiDomainName"
WEB_RTC_HELPER_DOMAIN_NAME=$(aws cloudformation list-exports --query "Exports[?Name=='${EXPORT_NAME_OF_WEB_RTC_HELPER_DOMAIN_NAME}'].Value" --output text)
aws cloudformation deploy \
  --template-file gb-backend-cloudfront.yaml \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_DEFAULT_REGION:?}" \
  --parameter-overrides \
  WebRTCHelperDomainName="${WEB_RTC_HELPER_DOMAIN_NAME}" \
  DistributionAlias="${BACKEND_CLOUDFRONT_DOMAIN_NAME:?}" \
  AcmCertificateArn="${BACKEND_CLOUDFRONT_CERT_ARN:?}" \
  WebACLArn="${BACKEND_CLOUDFRONT_WEB_ACL_ARN:?}" \
  --no-fail-on-empty-changeset
