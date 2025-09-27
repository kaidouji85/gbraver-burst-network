import { Command, CommandSchema } from "gbraver-burst-core";
import { z } from "zod";

/** コマンド送信イベント */
export type SendCommand = {
  /** フローID */
  flowId: string;
  /** コマンド */
  command: Command;
};

/**
 * コマンド送信イベントのzodスキーマ
 */
export const SendCommandSchema = z.object({
  flowId: z.string(),
  command: CommandSchema,
});
