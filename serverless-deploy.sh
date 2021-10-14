#!/bin/sh

if [ -z "$STAGE" ] || [ -z "$AUTH0_JWKS_URL" ] || [ -z "$AUTH0_AUDIENCE" ]; then
  echo 'required environment variables are not defined'
  exit 1
fi

OWN_PATH=`cd $(dirname ${0}) && pwd`
cd ${OWN_PATH}/packages/backend-app
npm ci
npx sls deploy --stage ${STAGE}