// @flow

import type {Command, GameState, PlayerCommand} from "gbraver-burst-core";
import {GbraverBurstCore} from "gbraver-burst-core";
import type {UserID} from "../user";
import {extractCommands} from "./extract-commands";
import {isWaiting} from "./is-waiting";
import {isDoubleEnterCommand} from "./is-double-enter-command";
import type {RoomUser} from "./room-user";

/** コマンド入力結果 */
export type InputCommandResult = Waiting | Progress | InputCommandError;

/** 相手のコマンド入力待ち */
export type Waiting = {
  type: 'Waiting'
};

/** ゲームが進んだ */
export type Progress = {
  type: 'Progress',
  update: GameState[]
};

/** エラー */
export type InputCommandError = {
  type: 'Error',
  error: any,
};

/** バトルルーム */
export class BattleRoom {
  _roomUsers: RoomUser[];
  _roomCommands: PlayerCommand[];
  _core: GbraverBurstCore;

  /**
   * コンストラクタ
   *
   * @param roomUsers 入室するユーザの情報
   */
  constructor(roomUsers: RoomUser[]) {
    this._roomUsers = roomUsers;
    this._core = new GbraverBurstCore(roomUsers.map(v => v.player));
    this._roomCommands = [];
  }

  /**
   * ルームにいる全ユーザの情報を取得する
   *
   * @return 取得結果
   */
  roomUsers(): RoomUser[] {
    return this._roomUsers;
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
   * @param userID コマンド入力するユーザのID
   * @param command 入力するコマンド
   * @return コマンド入力結果
   */
  enter(userID: UserID, command: Command): InputCommandResult {
    const target = this._roomUsers.find(v => v.userID === userID);
    if (!target) {
      return {type: 'Error', error: 'invalid userID'};
    }

    if (isDoubleEnterCommand(this._roomCommands, target.player.playerId)) {
      return {type: 'Error', error: `${userID}  double enter command`};
    }

    const playerCommand = {playerId: target.player.playerId, command: command};
    this._roomCommands = [...this._roomCommands, playerCommand];
    if (isWaiting(this._roomCommands)) {
      return {type: 'Waiting'};
    }

    const result = extractCommands(this._roomCommands);
    if (!result) {
      return {type: 'Error', error: 'invalid command'};
    }

    this._roomCommands = result.roomCommands;
    const update = this._core.progress(result.commands);
    return {type: 'Progress', update: update};
  }
}
