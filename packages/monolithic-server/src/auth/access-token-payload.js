// @flow

import type {Session} from "@gbraver-burst-network/core";

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
