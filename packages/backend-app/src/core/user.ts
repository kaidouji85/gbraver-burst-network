import { z } from "zod";

/** ユーザID */
export type UserID = string;

/** UserID zodスキーマ */
export const UserIDSchema = z.string();

/** ユーザ情報 */
export type User = {
  /** ユーザID */
  userID: UserID;
};
