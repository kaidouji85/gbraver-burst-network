FROM public.ecr.aws/lambda/nodejs:24

COPY .container-build/issue-auth-token.js ${LAMBDA_TASK_ROOT}/issue-auth-token.js

CMD ["issue-auth-token.issueAuthToken"]
