// @flow

import type {Session} from "@gbraver-burst-network/core/src/session/session";

/** アクセストークン payload */
export type AccessTokenPayload = Session;

/**
 * セッションからペイロードを生成する
 *
 * @param session セッション
 * @return ペイロード
 */
export function toPayload(session: Session): AccessTokenPayload {
  return session;
}

export function toSession(payload: AccessTokenPayload): Session {
  return payload;
}