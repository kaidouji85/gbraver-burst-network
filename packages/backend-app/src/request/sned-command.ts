import type { Command } from "gbraver-burst-core";
import { z } from "zod";

import type { BattleID, FlowID } from "../core/battle";
import {BattleIDSchema, FlowIDSchema} from "../core/battle";
import {CommandSchema} from "gbraver-burst-core";

/** バトルコマンド送信 */
export type SendCommand = {
  action: "send-command";
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
  /** コマンド */
  command: Command;
};

/** SendCommand zodスキーマ */
export const SendCommandSchema = z.object({
  action: z.literal("send-command"),
  battleID: BattleIDSchema,
  flowID: FlowIDSchema,
  command: CommandSchema,
})

/**
 * 任意オブジェクトをSendCommandにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元
 * @return パース結果
 */
export function parseSendCommand(data: unknown): SendCommand | null {
  const result = SendCommandSchema.safeParse(data);
  return result.success ? result.data : null;
}
