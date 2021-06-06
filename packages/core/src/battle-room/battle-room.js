// @flow

import type {Command, GameState, Player, PlayerCommand} from "gbraver-burst-core";
import {GbraverBurstCore} from "gbraver-burst-core";
import type {UserID} from "../user";
import {extractCommands} from "./extract-commands";
import {isWaiting} from "./is-waiting";
import {isDoubleEnterCommand} from "./is-double-enter-command";
import type {SessionID} from "../session/session";

/** コマンド入力結果 */
export type InputCommandResult = Waiting | Progress;

/** 相手のコマンド入力待ち */
export type Waiting = {
  type: 'Waiting'
};

/** ゲームが進んだ */
export type Progress = {
  type: 'Progress',
  update: GameState[]
};

/** セッション、ユーザのマッピング */
export type RoomPlayer = {
  /** セッションID */
  sessionID: SessionID,
  /** ユーザのプレイヤー情報 */
  player: Player,
}

/** バトルルーム */
export class BattleRoom {
  _roomPlayers: [RoomPlayer, RoomPlayer];
  _roomCommands: PlayerCommand[];
  _core: GbraverBurstCore;

  /**
   * コンストラクタ
   *
   * @param roomPlayers 入室するユーザの情報
   */
  constructor(roomPlayers: [RoomPlayer, RoomPlayer]) {
    this._roomPlayers = roomPlayers;
    this._core = new GbraverBurstCore([roomPlayers[0].player, roomPlayers[1].player]);
    this._roomCommands = [];
  }

  /**
   * ルームにいる全ユーザの情報を取得する
   *
   * @return 取得結果
   */
  roomPlayers(): [RoomPlayer, RoomPlayer] {
    return this._roomPlayers;
  }

  /**
   * ゲームステートの履歴を取得する
   *
   * @return 取得結果
   */
  stateHistory(): GameState[] {
    return this._core.stateHistory();
  }

  /**
   * コマンド入力する
   *
   * @param sessionID コマンド入力するセッションのID
   * @param command 入力するコマンド
   * @return コマンド入力結果
   */
  inputCommand(sessionID: UserID, command: Command): InputCommandResult {
    const target = this._roomPlayers.find(v => v.sessionID === sessionID);
    if (!target) {
      throw new Error('not found session');
    }

    if (isDoubleEnterCommand(this._roomCommands, target.player.playerId)) {
      throw new Error(`${sessionID} is double enter command`);
    }

    const playerCommand = {playerId: target.player.playerId, command: command};
    this._roomCommands = [...this._roomCommands, playerCommand];
    if (isWaiting(this._roomCommands)) {
      return {type: 'Waiting'};
    }

    const result = extractCommands(this._roomCommands);
    if (!result) {
      throw new Error('command extract fail');
    }

    this._roomCommands = result.roomCommands;
    const update = this._core.progress(result.commands);
    return {type: 'Progress', update: update};
  }
}
