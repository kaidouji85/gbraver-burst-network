import { CognitoJwtVerifier } from "aws-jwt-verify";

/**
 * Cognitoが発行したアクセストークンを検証する
 * @param userPoolId CognitoのユーザープールID
 * @param clientId CognitoのクライアントID
 * @param accessToken 検証するアクセストークン
 * @return 検証成功した場合はアクセストークンのペイロードを返す、失敗した場合は例外を投げる
 */
export async function verifyAccessTokenFromCognito(
  userPoolId: string,
  clientId: string,
  accessToken: string,
) {
  const verifier = CognitoJwtVerifier.create({
    userPoolId,
    clientId,
    tokenUse: "access",
  });
  return await verifier.verify(accessToken);
}
