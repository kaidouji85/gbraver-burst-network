import { z } from "zod";

/** オーナーがプライベートマッチルーム作成に成功した */
export type CreatedPrivateMatchRoom = {
  action: "created-private-match-room";
  /** 作成したルームID */
  roomID: string;
};

/** CreatedPrivateMatchRoom zodスキーマ */
export const CreatedPrivateMatchRoomSchema = z.object({
  action: z.literal("created-private-match-room"),
  roomID: z.string(),
});

/**
 * 任意オブジェクトをCreatedPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param data パース元
 * @return パース結果
 */
export function parseCreatedPrivateMatchRoom(
  data: unknown,
): CreatedPrivateMatchRoom | null {
  const result = CreatedPrivateMatchRoomSchema.safeParse(data);
  return result.success ? result.data : null;
}
