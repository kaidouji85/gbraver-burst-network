import { APIGatewayProxyResultV2 } from "aws-lambda";

import { createAuthToken } from "./core/auth-token";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoAuthTokens } from "./dynamo-db/dynamo-auth-tokens";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
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
  return {
    statusCode: 201,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(authToken),
  };
};
