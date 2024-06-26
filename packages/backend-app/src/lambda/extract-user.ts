import type { User } from "../core/user";
import type { JwtClaims } from "./rest-api-event";
import type { Authorizer } from "./websocket-api-event";

/**
 * Websocket API 認可情報からユーザ情報を抽出する
 *
 * @param authorizer 抽出元となる認可情報
 * @returns 抽出したユーザ情報
 */
export function extractUserFromWebSocketAuthorizer(
  authorizer: Authorizer,
): User {
  // authorizer.principalIdにセットされているauth0ユーザIDを
  // GブレイバーバーストのユーザIDにセットしている
  return {
    userID: authorizer.principalId,
  };
}

/**
 * Rest API JWTからユーザ情報を抽出する
 *
 * @param jwtClaims Rest API JWTクレーム
 * @returns 抽出したユーザ情報
 */
export function extractUserFromRestAPIJWT(jwtClaims: JwtClaims): User {
  // jwtClaims.subにセットされているauth0ユーザIDを
  // GブレイバーバーストのユーザIDにセットしている
  return {
    userID: jwtClaims.sub,
  };
}
