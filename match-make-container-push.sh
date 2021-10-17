#!/bin/sh

if [ -z "$STAGE" ] || [ -z "$DOCKER_USER" ] || [ -z "$DOCKER_TOKEN" ] || [ -z "$AWS_DEFAULT_REGION" ] || [ -z "$MATCH_MAKE_ECR_REPOSITORY_NAME" ]; then
  echo 'required environment variables are not defined'
  exit 1
fi

AWS_ACCOUNT_ID=`aws sts get-caller-identity --query Account --output text`
aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
echo $DOCKER_TOKEN | docker login -u $DOCKER_USER --password-stdin
IMAGE_TAG=$STAGE
IMAGE_REPO_NAME=$MATCH_MAKE_ECR_REPOSITORY_NAME
docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG -f matchMake.Dockerfile .
docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
