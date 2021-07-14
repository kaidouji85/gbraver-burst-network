// @flow

import type {Session} from "@gbraver-burst-network/core/src/session/session";

/** アクセストークン payload */
export type AccessTokenPayload = {
  /** セッションID */
  sessionID: string
};

export function toPayload(session: Session): AccessTokenPayload {
  return {sessionID: session.id};
}