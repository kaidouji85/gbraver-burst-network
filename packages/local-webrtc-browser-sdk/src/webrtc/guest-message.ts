import {
  ArmdozerId,
  Command,
  CommandSchema,
  PilotId,
} from "gbraver-burst-core";
import { z } from "zod";

/** 選択したプレイヤーをホストに送信する */
export type SendPlayer = {
  type: "send-player";
  /** ゲームのフローID */
  flowID: string;
  /** 選択したアームドーザーのID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットのID */
  pilotId: PilotId;
};

/** SendPlayer zod のスキーマ */
export const SendPlayerSchema = z.object({
  type: z.literal("send-player"),
  flowID: z.string(),
  armdozerId: z.string(),
  pilotId: z.string(),
});

/** コマンドをホストに送信する */
export type SendCommand = {
  type: "send-command";
  /** ゲームのフローID */
  flowID: string;
  /** コマンドの内容 */
  command: Command;
};

/** SendCommand zod のスキーマ */
export const SendCommandSchema = z.object({
  type: z.literal("send-command"),
  flowID: z.string(),
  command: z.object(CommandSchema),
});

/** ゲストから送信されるメッセージ */
export type GuestMessage = SendPlayer | SendCommand;
