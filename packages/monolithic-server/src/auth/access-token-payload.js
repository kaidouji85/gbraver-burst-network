// @flow

import type {Session} from "@gbraver-burst-network/core/src/session/session";

/** アクセストークンペイロード */
export type AccessTokenPayload = SessionPayload;

/** セッション情報を格納したペイロード */
export type SessionPayload = {
  type: 'SessionPayload',
  session: Session
};

/**
 * セッションからペイロードを生成する
 *
 * @param session セッション
 * @return ペイロード
 */
export function toPayload(session: Session): AccessTokenPayload {
  return {type: 'SessionPayload', session}
}

/**
 * ペイロードからセッションを取り出す
 *
 * @param payload ペイロード
 * @return セッション
 */
export function toSession(payload: AccessTokenPayload): Session {
  return payload.session;
}