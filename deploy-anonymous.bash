#!/bin/bash
set -Ceu

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}/packages/anonymous-backend-app" || exit
npx sls deploy --stage "${STAGE:?}"
