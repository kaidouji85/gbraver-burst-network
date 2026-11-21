import {
  GameState,
  GameStateSchema,
  Player,
  PlayerSchema,
} from "gbraver-burst-core";
import { z } from "zod";

/** Ping */
export type Ping = {
  type: "ping";
};

/** Ping zod のスキーマ */
export const PingSchema = z.object({
  type: z.literal("ping"),
});

/** 選択したキャラクターをホストに送信するように要求する */
export type RequestSelectedPlayer = {
  type: "request-selected-player";
  /** ゲームのフローID */
  flowID: string;
};

/** RequestSelectedPlayer zod のスキーマ */
export const RequestSelectedPlayerSchema = z.object({
  type: z.literal("request-selected-player"),
  flowID: z.string(),
});

/** バトルを開始する */
export type BattleStart = {
  type: "battle-start";
  /** ゲームのフローID */
  flowID: string;
  /** ホストプレイヤー */
  hostPlayer: Player;
  /** ゲストプレイヤー */
  guestPlayer: Player;
  /** 更新されたゲームステート履歴 */
  update: GameState[];
};

/** BattleStart zod のスキーマ */
export const BattleStartSchema = z.object({
  type: z.literal("battle-start"),
  flowID: z.string(),
  hostPlayer: PlayerSchema,
  guestPlayer: PlayerSchema,
  update: z.array(GameStateSchema),
});

/** バトルが進行した */
export type BattleProgressed = {
  type: "battle-progressed";
  /** ゲームのフローID */
  flowID: string;
  /** 更新されたゲームステート履歴 */
  update: GameState[];
};

/** BattleProgressed zod のスキーマ */
export const BattleProgressedSchema = z.object({
  type: z.literal("battle-progressed"),
  flowID: z.string(),
  update: z.array(GameStateSchema),
});

/** バトルが終了した */
export type BattleEnd = {
  type: "battle-end";
  /** 更新されたゲームステート */
  update: GameState[];
  /** 再戦ルームID */
  rematchRoomID: string;
};

/** BattleEnd zod のスキーマ */
export const BattleEndSchema = z.object({
  type: z.literal("battle-end"),
  update: z.array(GameStateSchema),
  rematchRoomID: z.string(),
});

/** 再戦キャンセル（ホスト側） */
export type HostCancelRematch = {
  type: "host-cancel-rematch";
  /** 再戦ルームID */
  rematchRoomID: string;
};

/** HostCancelRematch zod のスキーマ */
export const HostCancelRematchSchema = z.object({
  type: z.literal("host-cancel-rematch"),
  rematchRoomID: z.string(),
});

/** ホストから送信されるメッセージ */
export type HostMessage =
  | Ping
  | RequestSelectedPlayer
  | BattleStart
  | BattleProgressed
  | BattleEnd
  | HostCancelRematch;

/**
 * ホストメッセージをゲストに送信する
 * @param dataChannel データチャンネル
 * @param message メッセージ内容
 */
export const sendHostMessage = (
  dataChannel: RTCDataChannel,
  message: HostMessage,
): void => {
  dataChannel.send(JSON.stringify(message));
};
