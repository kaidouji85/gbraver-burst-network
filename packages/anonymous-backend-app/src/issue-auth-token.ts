import { APIGatewayProxyResultV2 } from "aws-lambda";

import { createAuthToken } from "./core/auth-token";
import { DynamoAuthTokens } from "./dynamo-db/dynamo-auth-tokens";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { createIssueAuthTokenSuccessResponse } from "./http-api/response/issue-auth-token-success";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** DynamoDB authTokens テーブル名 */
const DYNAMO_AUTH_TOKENS_TABLE = process.env.DYNAMODB_AUTH_TOKENS_TABLE ?? "";

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB authTokens DAO */
const dynamoAuthTokens = new DynamoAuthTokens(
  dynamoDB,
  DYNAMO_AUTH_TOKENS_TABLE,
);

/**
 * 認証トークンを発行する
 * @returns HTTPレスポンス
 */
export const issueAuthToken = async (): Promise<APIGatewayProxyResultV2> => {
  const authToken = createAuthToken();
  await dynamoAuthTokens.put(authToken);
  return createIssueAuthTokenSuccessResponse(authToken);
};
