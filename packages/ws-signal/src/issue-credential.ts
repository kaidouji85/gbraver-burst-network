import { getSecret } from "@aws-lambda-powertools/parameters/secrets";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

/** coturnサーバーとの共有秘密鍵が格納されているAWS Secrets Managerのシークレット名 */
const COTURN_SHARED_SECRET = process.env.COTURN_SHARED_SECRET ?? "";

/** coturnサーバーとの共有秘密鍵のPromise */
const coturnSharedSecretPromise = getSecret(COTURN_SHARED_SECRET);

/**
 * coturn用のクレデンシャルを発行する
 * @param event イベント
 * @returns レスポンス
 */
export const issueCoturnCredential = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResult> => {
  const coturnSharedSecret = await coturnSharedSecretPromise;
  return { statusCode: 201, body: "hello" };
};
