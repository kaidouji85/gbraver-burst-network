#!/bin/sh

if [ -z "${SERVICE}" ] ||
  [ -z "${STAGE}" ] ||
  [ -z "${ALLOW_ORIGIN}" ] ||
  [ -z "${TEST_ALLOW_ORIGIN}" ] ||
  [ -z "${AUTH0_DOMAIN}" ] ||
  [ -z "$AUTH0_JWKS_URL" ] ||
  [ -z "$AUTH0_AUDIENCE" ] ||
  [ -z "${AUTH0_USER_MANAGEMENT_APP_CLIENT_ID}" ] ||
  [ -z "${AUTH0_USER_MANAGEMENT_APP_CLIENT_SECRET}" ] ||
  [ -z "${VPC_SUBNET_COUNT}" ]; then
  echo 'required environment variables are not defined'
  exit 1
fi

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}/packages/backend-app" || exit
npx sls deploy --stage "${STAGE}"
