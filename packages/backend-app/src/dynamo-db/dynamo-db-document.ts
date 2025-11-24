import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDBクライアントを生成する
 *
 * @param region AWSのリージョン
 * @param useDualstackEndpoint AWS APIのデュアルスタックエンドポイントを使用するかどうか、falseであれば標準エンドポイントを使用する
 * @returns DynamoDBクライアント
 */
export function createDynamoDBDocument(
  region: string,
  useDualstackEndpoint = false,
): DynamoDBDocument {
  return DynamoDBDocument.from(
    new DynamoDB({
      apiVersion: "2012-08-10",
      region,
      useDualstackEndpoint,
    }),
  );
}
