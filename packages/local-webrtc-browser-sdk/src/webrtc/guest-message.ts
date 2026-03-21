import { ArmdozerId, Command, PilotId } from "gbraver-burst-core";

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

/** コマンドをホストに送信する */
export type SendCommand = {
  type: "send-command";
  /** ゲームのフローID */
  flowID: string;
  /** コマンドの内容 */
  command: Command;
};

/** ゲストから送信されるメッセージ */
export type GuestMessage = SendPlayer | SendCommand;
