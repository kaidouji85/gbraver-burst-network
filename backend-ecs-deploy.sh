#!/bin/sh

if [ -z "$STAGE" ] || [ -z "$MATCH_MAKE_ECR_REPOSITORY_NAME" ]; then
  echo 'required environment variables are not defined'
  exit 1
fi

OWN_PATH=$(cd $(dirname ${0}) && pwd)
cd ${OWN_PATH}/packages/backend-ecs
npx cdk deploy -f --require-approval never
