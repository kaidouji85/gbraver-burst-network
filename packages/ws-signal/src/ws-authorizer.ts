import { DynamoAuthTokens } from "./dynamo-db/dynamo-auth-tokens";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { AuthorizerEvent } from "./websocket/lambda-authorizer/authorizer-event";
import {
  failedAuthorize,
  successAuthorize,
} from "./websocket/lambda-authorizer/authorizer-response";

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
 * WebSocket 用のオーサライザ
 * @param event イベント
 * @returns 認証結果
 */
export const wsAuthorizer = async (event: AuthorizerEvent) => {
  const resource = event.methodArn;
  const { token } = event.queryStringParameters;
  const tokenHash = await dynamoAuthTokens.getTokenHash(token);
  return tokenHash !== null
    ? successAuthorize(tokenHash.tokenHash, resource)
    : failedAuthorize("unauthorized", resource);
};
