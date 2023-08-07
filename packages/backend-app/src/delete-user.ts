import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { ManagementClient } from "auth0";

import { parseAuth0Secret } from "./aws-secret-manager/auth0-secret";
import { parseJSON } from "./json/parse";
import { extractUserFromRestAPIJWT } from "./lambda/extract-user";
import type { RestAPIEvent } from "./lambda/rest-api-event";
import type { RestAPIResponse } from "./lambda/rest-api-response";

/** AWS リージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** Auth0 Management APIの接続先ドメイン */
const AUTH0_USER_MANAGEMENT_DOMAIN =
  process.env.AUTH0_USER_MANAGEMENT_DOMAIN ?? "";
/** Auth0 Management API に認証されたApplicationのclient id */
const AUTH0_USER_MANAGEMENT_APP_CLIENT_ID =
  process.env.AUTH0_USER_MANAGEMENT_APP_CLIENT_ID ?? "";
/** Auth0シークレット情報をセットした AWS Secret Managerのシークレット名 */
const AUTH0_SECRET_NAME = process.env.AUTH0_SECRET_NAME ?? "";

/** AWSシークレットマネジャークライアント */
const secretManagerClient = new SecretsManagerClient({
  region: AWS_REGION,
});

/** HTTP 500 レスポンス */
const responseHTTP500 = {
  statusCode: 500,
  body: "something went wrong",
};

/**
 * ユーザ削除API
 * @param event イベント
 * @return レスポンス
 */
export async function deleteUser(
  event: RestAPIEvent,
): Promise<RestAPIResponse> {
  const secretManagerResponse = await secretManagerClient.send(
    new GetSecretValueCommand({
      SecretId: AUTH0_SECRET_NAME,
      VersionStage: "AWSCURRENT",
    }),
  );

  const parsedSecureString = parseJSON(secretManagerResponse.SecretString);
  if (!parsedSecureString) {
    return responseHTTP500;
  }

  const auth0Secret = parseAuth0Secret(parsedSecureString);
  if (!auth0Secret) {
    return responseHTTP500;
  }

  const auth0ManagementClient = new ManagementClient({
    domain: AUTH0_USER_MANAGEMENT_DOMAIN,
    clientId: AUTH0_USER_MANAGEMENT_APP_CLIENT_ID,
    clientSecret: auth0Secret.auth0UserManagementAppClientSecret,
    scope: "delete:users",
  });
  const user = extractUserFromRestAPIJWT(
    event.requestContext.authorizer.jwt.claims,
  );
  // auth0ユーザ削除関数にGブレイバーバーストのユーザIDを指定しているが、
  // 現状ではauth0、GブレイバーバーストのユーザIDは完全一致するので問題ない
  await auth0ManagementClient.deleteUser({
    id: user.userID,
  });
  return {
    statusCode: 200,
    body: "delete user success",
  };
}
