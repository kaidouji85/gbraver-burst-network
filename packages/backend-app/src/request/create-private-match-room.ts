import { z } from "zod";

/** プライベートマッチルーム生成 */
export type CreatePrivateMatchRoom = {
  action: "create-private-match-room";
  /** 選択したアームドーザのID */
  armdozerId: string;
  /** 選択したパイロットのID */
  pilotId: string;
};

/** プライベートマッチルーム生成 zodスキーマ */
export const CreatePrivateMatchRoomSchema = z.object({
  action: z.literal("create-private-match-room"),
  armdozerId: z.string(),
  pilotId: z.string(),
});

/**
 * 任意オブジェクトをCreatePrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @returns パース結果
 */
export function parseCreatePrivateMatchRoom(
  origin: unknown,
): CreatePrivateMatchRoom | null {
  const result = CreatePrivateMatchRoomSchema.safeParse(origin);
  return result.success ? result.data : null;
}
