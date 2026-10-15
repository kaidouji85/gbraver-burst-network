import { z } from "zod";

import { UserID, UserIDSchema } from "../../user";

/** 再戦ルームID（ユニークな識別子） */
export type RematchRoomID = string;

/** RematchRoom ID zod スキーマ */
export const RematchRoomIDSchema = z.string();

/** 再戦ルーム */
export type RematchRoom = {
  /** 再戦ルームID */
  roomID: RematchRoomID;
  /** ホストユーザーID */
  hostUserID: UserID;
  /** ホストユーザーの接続ID */
  hostUserConnectionId: string;
  /** ゲストユーザーID */
  guestUserID: UserID;
  /** ゲストユーザーの接続ID */
  guestUserConnectionId: string;
  /** 再戦の有効期限（Unix秒） */
  expiresAt: number;
};

/** RematchRoom zod スキーマ */
export const RematchRoomSchema = z.object({
  roomID: RematchRoomIDSchema,
  hostUserID: UserIDSchema,
  hostUserConnectionId: z.string(),
  guestUserID: UserIDSchema,
  guestUserConnectionId: z.string(),
  expiresAt: z.number(),
});
