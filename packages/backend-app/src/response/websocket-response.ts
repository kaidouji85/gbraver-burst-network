import { GameState } from "gbraver-burst-core";

import { FlowID } from "../core/battle";
import { PrivateMatchRoomID } from "../core/private-match-room";
import { AcceptCommand } from "./accept-command";
import { BattleStart } from "./battle-start";
import { EnteredCasualMatch } from "./entered-casual-match";
import { NotReadyBattleProgress } from "./not-ready-battle-progress";
import { Pong } from "./pong";

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
