#!/bin/bash
set -Ceu

OWN_PATH=$(cd "$(dirname "${0}")" && pwd)
cd "${OWN_PATH}/packages/backend-app" || exit
npm run build:match-make
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region "$AWS_DEFAULT_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
IMAGE_REPO_NAME=$MATCH_MAKE_ECR_REPOSITORY_NAME
docker build -t "${IMAGE_REPO_NAME}:${DOCKER_IMAGE_TAG}" -f matchMake.Dockerfile .
docker tag "${IMAGE_REPO_NAME}:${DOCKER_IMAGE_TAG}" "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${DOCKER_IMAGE_TAG}"
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/$IMAGE_REPO_NAME:$DOCKER_IMAGE_TAG"
