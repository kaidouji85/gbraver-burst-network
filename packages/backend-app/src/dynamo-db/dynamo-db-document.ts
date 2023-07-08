import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDBクライアントを生成する
 *
 * @return region AWSのリージョン
 * @return DynamoDBクライアント
 */
export function createDynamoDBDocument(region: string): DynamoDBDocument {
  return DynamoDBDocument.from(
    new DynamoDB({
      apiVersion: "2012-08-10",
      region,
    }),
  );
}
