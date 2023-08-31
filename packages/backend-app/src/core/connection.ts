import { PlayerId, PlayerIdSchema } from "gbraver-burst-core";
import { z } from "zod";

import { BattleID, BattleIDSchema } from "./battle";
import { PrivateMatchRoomID, PrivateMatchRoomIDSchema } from "./private-match-room";
import { UserID, UserIDSchema } from "./user";

/** 状態なし */
export type None = {
  type: "None";
};

/** None zodスキーマ */
export const NoneSchema = z.object({
  type: z.literal("None"),
});

/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: "CasualMatchMaking";
};

/** CasualMatchMaking zodスキーマ */
export const CasualMatchMakingSchema = z.object({
  type: z.literal("CasualMatchMaking"),
});

/** バトルに参加しているプレイヤー */
export type InBattlePlayer = {
  /** ユーザID */
  userID: UserID;
  /** プレイヤーID */
  playerId: PlayerId;
  /** コネクションID */
  connectionId: string;
};

/** InBattlePlayer zodスキーマ */
export const InBattlePlayerSchema = z.object({
  userID: UserIDSchema,
  playerId: PlayerIdSchema,
  connectionId: z.string(),
});

/** 戦闘中 */
export type InBattle = {
  type: "InBattle";
  /** 現在実行している戦闘のID */
  battleID: BattleID;
  /** バトルに参加しているプレイヤーの情報 */
  players: [InBattlePlayer, InBattlePlayer];
};

/** InBattle zodスキーマ */
export const InBattleSchema = z.object({
  type: z.literal("InBattle"),
  battleID: BattleIDSchema,
  players: z.tuple([InBattlePlayerSchema, InBattlePlayerSchema]),
});

/** プライベートマッチ開催 */
export type HoldPrivateMatch = {
  type: "HoldPrivateMatch";
  /** 作成したルームのID */
  roomID: PrivateMatchRoomID;
};

/** HoldPrivateMatch zodスキーマ */
export const HoldPrivateMatchSchema = z.object({
  type: z.literal("HoldPrivateMatch"),
  roomID: PrivateMatchRoomIDSchema,
});

/** プライベートマッチメイク中 */
export type PrivateMatchMaking = {
  type: "PrivateMatchMaking";
  /** ルームID */
  roomID: PrivateMatchRoomID;
};

/** PrivateMatchMaking zodスキーマ */
export const PrivateMatchMakingSchema = z.object({
  type: z.literal("PrivateMatchMaking"),
  roomID: PrivateMatchRoomIDSchema,
});

/** コネクションの状態 */
export type ConnectionState =
  | None
  | CasualMatchMaking
  | InBattle
  | HoldPrivateMatch
  | PrivateMatchMaking;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([
  NoneSchema,
  CasualMatchMakingSchema,
  InBattleSchema,
  HoldPrivateMatchSchema,
  PrivateMatchMakingSchema,
]);

/** WebsocketAPI コネクションステート */
export type Connection = {
  /** コネクションID */
  connectionId: string;
  /** ユーザID */
  userID: UserID;
  /** ステート */
  state: ConnectionState;
};

/** Connection zodスキーマ */
export const ConnectionSchema = z.object({
  connectionId: z.string(),
  userID: UserIDSchema,
  state: ConnectionStateSchema,
});