import type { Command } from "gbraver-burst-core";

import type { BattleID, FlowID } from "../core/battle";

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

/**
 * 任意オブジェクトをSendCommandにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元
 * @return パース結果
 */
export function parseSendCommand(data: any): SendCommand | null | undefined {
  // TODO commandの正確な型チェックを実装する
  return data?.action === "send-command" &&
    typeof data?.battleID === "string" &&
    typeof data?.flowID === "string" &&
    data?.command !== null &&
    typeof data?.command === "object"
    ? {
        action: data.action,
        battleID: data.battleID,
        flowID: data.flowID,
        command: data.command,
      }
    : null;
}
