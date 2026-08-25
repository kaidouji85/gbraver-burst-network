import { z } from "zod";

import { ConnectionState, ConnectionStateSchema } from "./connection-state";

/** コネクション */
export type Connection = {
  /** API GatewayでのコネクションID */
  connectionId: string;
  /** ステート */
  state: ConnectionState;
};

/** Connection zodスキーマ */
export const ConnectionSchema = z.object({
  connectionId: z.string(),
  state: ConnectionStateSchema,
});
