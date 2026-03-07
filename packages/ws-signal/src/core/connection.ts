import { z } from "zod";

/** 状態なし */
export type None = {
  type: "None";
};

/** None zodスキーマ */
export const NoneSchema = z.object({
  type: z.literal("None"),
});

/** コネクションステート */
export type ConnectionState = None;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([NoneSchema]);

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
