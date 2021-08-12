// @flow

import type {Command, GameState, Player, PlayerCommand} from "gbraver-burst-core";
import {GbraverBurstCore} from "gbraver-burst-core";
import type {UserID} from "../users/user";
import {extractCommands} from "./extract-commands";
import {isWaiting} from "./is-waiting";
import {isDoubleEnterCommand} from "./is-double-enter-command";

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

/** ユーザ、プレイヤーのマッピング */
export type RoomPlayer = {
  /** ユーザID */
  userID: UserID,
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
   * @param userID コマンド入力するユーザのID
   * @param command 入力するコマンド
   * @return コマンド入力結果
   */
  inputCommand(userID: UserID, command: Command): InputCommandResult {
    const target = this._roomPlayers.find(v => v.userID === userID);
    if (!target) {
      throw new Error('not found user');
    }

    if (isDoubleEnterCommand(this._roomCommands, target.player.playerId)) {
      throw new Error(`${userID} is double enter command`);
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
