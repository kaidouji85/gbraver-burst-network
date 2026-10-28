FROM node:24 AS builder

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY packages/ packages/

RUN npm ci --workspace=@gbraver-burst-network/anonymous-backend-app --include-workspace-root=false
RUN npm run --workspace=@gbraver-burst-network/anonymous-backend-app build:container

FROM public.ecr.aws/lambda/nodejs:24

COPY --from=builder /workspace/packages/anonymous-backend-app/.serverless/container/ ${LAMBDA_TASK_ROOT}/

# 実行するハンドラは serverless.yml の関数ごとの image.command で指定する
CMD ["issue-auth-token.issueAuthToken"]
