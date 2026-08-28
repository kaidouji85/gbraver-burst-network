import { z } from "zod";

/** ルームの状態 */
export type WSSignalRoomState =
  /** ゲストの参加を待っている */
  | "awaiting-guest-join"
  /** シグナリングチャネルの作成を待っている */
  | "awaiting-signaling-channel-created";

/** WSSignalRoomState zod スキーマ */
export const WSSignalRoomStateSchema = z.union([
  z.literal("awaiting-guest-join"),
  z.literal("awaiting-signaling-channel-created"),
]);

/** ルーム情報 */
export type WSSignalRoom = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /** ホストのWebSocket API Gateway コネクションID */
  hostConnectionId: string;
  /** ルームの状態 */
  state: WSSignalRoomState;
};

/** WSSignalRoom zod スキーマ */
export const WSSignalRoomSchema = z.object({
  roomID: z.string(),
  hostConnectionId: z.string(),
  state: WSSignalRoomStateSchema,
});
