#!/bin/bash
set -Ceu

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}/packages/ws-signal" || exit
npx sls deploy --stage "${STAGE:?}"