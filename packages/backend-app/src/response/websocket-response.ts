import type { GameState } from "gbraver-burst-core";

import type { FlowID } from "../core/battle";
import { PrivateMatchRoomID } from "../core/private-match-room";
import { Pong } from "./pong";
import { EnteredCasualMatch } from "./entered-casual-match";
import { AcceptCommand } from "./accept-command";
import { BattleStart } from "./battle-start";

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
