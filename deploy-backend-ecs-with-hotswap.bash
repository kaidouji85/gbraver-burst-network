#!/bin/bash
set -Ceu

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}/packages/backend-ecs" || exit
npx cdk deploy -f --require-approval never --hotswap
