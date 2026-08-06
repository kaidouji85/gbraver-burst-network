import { z } from "zod";

/** coturn用クレデンシャル発行結果 */
export type IssueCoturnCredentialResponse = {
  /** ユーザー名 */
  username: string;
  /** パスワード */
  password: string;
};

/** IssueCoturnCredentialResponse zod スキーマ */
export const IssueCoturnCredentialResponseSchema = z.object({
  username: z.string(),
  password: z.string(),
});
