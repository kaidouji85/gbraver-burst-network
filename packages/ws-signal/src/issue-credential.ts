import { getSecret } from "@aws-lambda-powertools/parameters/secrets";
import { APIGatewayProxyResult } from "aws-lambda";
import { createHmac } from "crypto";

/** coturnサーバーとの共有秘密鍵が格納されているAWS Secrets Managerのシークレット名 */
const COTURN_SHARED_SECRET = process.env.COTURN_SHARED_SECRET ?? "";
/** coturnクレデンシャル有効期限（秒） */
const COTURN_CREDENTIAL_TTL_SECONDS = 60 * 15;

/** coturnサーバーとの共有秘密鍵のPromise */
const coturnSharedSecretPromise = getSecret(COTURN_SHARED_SECRET);

/**
 * coturn用のクレデンシャルを発行する
 * @returns レスポンス
 */
export const issueCoturnCredential =
  async (): Promise<APIGatewayProxyResult> => {
    const coturnSharedSecret = String(await coturnSharedSecretPromise);
    const expiresAt =
      Math.floor(Date.now() / 1000) + COTURN_CREDENTIAL_TTL_SECONDS;
    const username = `${expiresAt}:webrtc-user`;
    const password = createHmac("sha1", coturnSharedSecret)
      .update(username)
      .digest("base64");

    return {
      statusCode: 201,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    };
  };
