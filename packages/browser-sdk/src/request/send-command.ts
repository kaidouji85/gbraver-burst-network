import type { Command } from "gbraver-burst-core";

/** バトルコマンド送信 */
export type SendCommand = {
  action: "send-command";

  /** バトルID */
  battleID: string;

  /** フローID */
  flowID: string;

  /** コマンド */
  command: Command;
};