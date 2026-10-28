FROM node:24 AS builder

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY packages/ packages/

RUN npm ci --workspace=@gbraver-burst-network/anonymous-backend-app --include-workspace-root=false
RUN npm run --workspace=@gbraver-burst-network/anonymous-backend-app build:container

FROM public.ecr.aws/lambda/nodejs:24

COPY --from=builder /workspace/packages/anonymous-backend-app/.serverless/container/issue-auth-token.js ${LAMBDA_TASK_ROOT}/issue-auth-token.js

CMD ["issue-auth-token.issueAuthToken"]
