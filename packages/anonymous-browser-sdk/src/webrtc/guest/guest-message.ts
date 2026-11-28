import {
  ArmdozerId,
  Command,
  CommandSchema,
  PilotId,
} from "gbraver-burst-core";
import { z } from "zod";

/** Pong */
export type Pong = {
  type: "pong";
};

/** Pong zod のスキーマ */
export const PongSchema = z.object({
  type: z.literal("pong"),
});

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
  command: CommandSchema,
});

/** 再戦ルームに入室する */
export type EnterRematchRoom = {
  type: "enter-rematch-room";
  /** 再戦ルームID */
  rematchRoomID: string;
  /** 選択したアームドーザーのID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットのID */
  pilotId: PilotId;
};

/** EnterRematchRoom zod のスキーマ */
export const EnterRematchRoomSchema = z.object({
  type: z.literal("enter-rematch-room"),
  rematchRoomID: z.string(),
  armdozerId: z.string(),
  pilotId: z.string(),
});

/** ゲストから送信されるメッセージ */
export type GuestMessage = Pong | SendPlayer | SendCommand | EnterRematchRoom;

/**
 * ゲストメッセージをホストに送信する
 * @param dataChannel データチャンネル
 * @param message メッセージ内容
 */
export const sendGuestMessage = (
  dataChannel: RTCDataChannel,
  message: GuestMessage,
): void => {
  dataChannel.send(JSON.stringify(message));
};
