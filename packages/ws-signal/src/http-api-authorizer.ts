import {
  APIGatewayProxyEventV2,
  APIGatewaySimpleAuthorizerResult,
  APIGatewaySimpleAuthorizerWithContextResult,
} from "aws-lambda";

import { extractBearerToken, HashAuthToken } from "./core/auth-token";
import { DynamoAuthTokens } from "./dynamo-db/dynamo-auth-tokens";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";

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
 * HTTP API用のオーソライザー
 * @returns 認証結果
 */
export const httpAPIAuthorizer = async (
  event: APIGatewayProxyEventV2,
): Promise<
  | APIGatewaySimpleAuthorizerWithContextResult<HashAuthToken>
  | APIGatewaySimpleAuthorizerResult
> => {
  const token = extractBearerToken(event.headers.authorization || "");
  if (token === null) {
    return { isAuthorized: false };
  }

  const authToken = await dynamoAuthTokens.getHashToken(token);
  if (!authToken) {
    return { isAuthorized: false };
  }

  return { isAuthorized: true, context: authToken };
};
