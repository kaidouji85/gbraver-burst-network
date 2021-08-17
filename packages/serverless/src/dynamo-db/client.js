// @flow

import {DynamoDB} from "aws-sdk";

/**
 * DynamoDBクライアントを生成する
 *
 * @return region AWSのリージョン
 * @return DynamoDBクライアント
 */
export function createDynamoDBClient(region: string): typeof DynamoDB.DocumentClient {
  return new DynamoDB.DocumentClient({apiVersion: '2012-08-10', region});
}