#!/bin/sh

if [ -z "$SERVICE" ] || [ -z "$STAGE" ]; then
  echo 'required environment variables are not defined'
  exit 1
fi

OWN_PATH=`cd $(dirname ${0}) && pwd`
cd ${OWN_PATH}/packages/backend-app
npx sls remove --stage ${STAGE}
