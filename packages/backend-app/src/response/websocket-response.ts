import type { GameState, Player } from "gbraver-burst-core";

import type { BattleID, FlowID } from "../core/battle";
import { PrivateMatchRoomID } from "../core/private-match-room";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | EnteredCasualMatch
  | AcceptCommand
  | BattleStart
  | NotReadyBattleProgress
  | BattleProgressed
  | BattleEnd
  | SuddenlyBattleEnd
  | CreatedPrivateMatchRoom
  | CouldNotPrivateMatchMaking
  | RejectPrivateMatchEntry
  | Error;

/** pingの応答 */
export type Pong = {
  action: "pong";
  message: string;
};

/** カジュアルマッチ入室成功 */
export type EnteredCasualMatch = {
  action: "entered-casual-match";
};

/** コマンド受取通知 */
export type AcceptCommand = {
  action: "accept-command";
};

/** 戦闘開始 */
export type BattleStart = {
  action: "battle-start";

  /** プレイヤー情報 */
  player: Player;

  /** 敵情報 */
  enemy: Player;

  /** 戦闘ID */
  battleID: BattleID;

  /** ステートヒストリー */
  stateHistory: GameState[];

  /** フローID */
  flowID: FlowID;

  /** 戦闘進捗ポーリングを実行する側か否か、trueでポーリングをする */
  isPoller: boolean;
};

/** バトル進行の準備ができていない */
export type NotReadyBattleProgress = {
  action: "not-ready-battle-progress";
};

/** バトル進行通知 */
export type BattleProgressed = {
  action: "battle-progressed";

  /** 発行されたフローID */
  flowID: FlowID;

  /** 更新されたゲームステート */
  update: GameState[];
};

/** バトル強制終了 */
export type SuddenlyBattleEnd = {
  action: "suddenly-battle-end";
};

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";

  /** 更新されたゲームステート */
  update: GameState[];
};

/** オーナーがプライベートマッチルーム作成に成功した */
export type CreatedPrivateMatchRoom = {
  action: "created-private-match-room";
  /** 作成したルームID */
  roomID: PrivateMatchRoomID;
};

/** オーナーがプライベートマッチングできなかった */
export type CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making";
};

/** 何らかの理由でプライベートマッチに参加できなかった */
export type RejectPrivateMatchEntry = {
  action: "reject-private-match-entry";
};

/** エラー */
export type Error = {
  action: "error";
  /* eslint-disable @typescript-eslint/no-explicit-any */
  error: any;
  /* eslint-enable */
};
