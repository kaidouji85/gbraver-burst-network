// @flow

import type {Command, GameState, Player, PlayerCommand} from "gbraver-burst-core";
import {GbraverBurstCore} from "gbraver-burst-core";
import type {UserID} from "../user";
import {extractCommands} from "./extract-commands";
import {isWaiting} from "./is-waiting";

/** 入室しているユーザの情報 */
export type RoomUser = {
  /** ユーザID */
  userID: UserID,
  /** ユーザのプレイヤー情報 */
  player: Player,
}

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
  _roomPlayers: RoomUser[];
  _core: GbraverBurstCore;
  _commands: PlayerCommand[];

  /**
   * コンストラクタ
   *
   * @param players 入室するユーザの情報
   */
  constructor(players: RoomUser[]) {
    this._roomPlayers = players;
    this._core = new GbraverBurstCore(players.map(v => v.player));
    this._commands = [];
  }

  /**
   * ルームにいる全ユーザの情報を取得する
   *
   * @return 取得結果
   */
  roomUsers(): RoomUser[] {
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
   * @param userId コマンド入力するユーザのID
   * @param command 入力するコマンド
   * @return コマンド入力結果
   */
  inputCommand(userId: UserID, command: Command): InputCommandResult {
    const target = this._roomPlayers.find(v => v.userID === userId);
    if (!target) {
      return {type: 'Error', error: 'invalid userID'};
    }

    const playerCommand = {playerId: target.player.playerId, command: command};
    this._commands = [...this._commands, playerCommand];
    if (isWaiting(this._commands)) {
      return {type: 'Waiting'};
    }

    const result = extractCommands(this._commands);
    if (!result) {
      return {type: 'Error', error: 'fail extract commands'};
    }

    this._commands = result.roomCommands;
    const update = this._core.progress(result.commands);
    return {type: 'Progress', update: update};
  }
}
