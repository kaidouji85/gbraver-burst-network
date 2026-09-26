import { z } from "zod";

import { UserID, UserIDSchema } from "../user";
import { ConnectionState, ConnectionStateSchema } from "./state";

/** WebsocketAPI コネクションステート */
export type Connection = {
  /** コネクションID */
  connectionId: string;
  /** ユーザID */
  userID: UserID;
  /** ステート */
  state: ConnectionState;
};

/** Connection zodスキーマ */
export const ConnectionSchema = z.object({
  connectionId: z.string(),
  userID: UserIDSchema,
  state: ConnectionStateSchema,
});
