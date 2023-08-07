import { z } from "zod";

/** AWS Secret Managerにセットしたauth0シークレット情報 */
export type Auth0Secret = {
  /**  Auth0 Management API に認証されたApplicationのclient secret */
  auth0UserManagementAppClientSecret: string;
};

/** Auth0Secret zodスキーマ */
export const Auth0SecretSchema = z.object({
  auth0UserManagementAppClientSecret: z.string(),
});

/**
 * 任意オブジェクトをAuth0Secretにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @returns パース結果
 */
export function parseAuth0SecretSchema(origin: unknown): Auth0Secret | null {
  const result = Auth0SecretSchema.safeParse(origin);
  return result.success ? result.data : null;
}
