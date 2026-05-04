import { z } from "zod";

/** ルーム生成成功 */
export type RoomCreationSuccess = {
  type: "room-creation-result";
  /** ルーム生成が成功したか否か、成功したのでtrue */
  isSuccess: true;
  /** ルームID */
  roomID: string;
};

/** RoomCreationSuccess zod スキーマ */
export const RoomCreationSuccessSchema = z.object({
  type: z.literal("room-creation-result"),
  isSuccess: z.literal(true),
  roomID: z.string(),
});

/** ルーム生成失敗 */
export type RoomCreationFailure = {
  type: "room-creation-result";
  /** ルーム生成が成功したか否か、失敗したのでfalse */
  isSuccess: false;
};

/** RoomCreationFailure zod スキーマ */
export const RoomCreationFailureSchema = z.object({
  type: z.literal("room-creation-result"),
  isSuccess: z.literal(false),
});

/** ルーム生成結果 */
export type RoomCreationResult = RoomCreationSuccess | RoomCreationFailure;

/** RoomCreationResult zod スキーマ */
export const RoomCreationResultSchema = z.union([
  RoomCreationSuccessSchema,
  RoomCreationFailureSchema,
]);
