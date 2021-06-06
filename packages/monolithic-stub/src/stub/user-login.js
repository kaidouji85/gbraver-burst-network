// @flow

import type {UserID} from "@gbraver-burst-network/core";

/** ユーザログイン情報 */
export type UserLogin = {
  id: UserID,
  password: string
};