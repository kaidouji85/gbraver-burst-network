import { z } from "zod";

import { UserID, UserIDSchema } from "../../user";

/** 再戦ID（ユニークな識別子） */
export type RematchId = string;

/** Rematch ID zod スキーマ */
export const RematchIdSchema = z.string();

/** 再戦管理オブジェクト */
export type Rematch = {
  /** 再戦ID */
  id: RematchId;
  /** ホストユーザーID */
  hostUserID: UserID;
  /** ゲストユーザーID */
  guestUserID: UserID;
  /** 再戦の有効期限（Unix秒） */
  expiresAt: number;
};

/** Rematch zod スキーマ */
export const RematchSchema = z.object({
  id: RematchIdSchema,
  hostUserID: UserIDSchema,
  guestUserID: UserIDSchema,
  expiresAt: z.number(),
});
