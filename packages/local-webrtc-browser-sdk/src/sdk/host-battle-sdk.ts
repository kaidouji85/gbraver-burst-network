import { nanoid } from "nanoid";

import {
  ArmdozerId,
  Armdozers,
  GameState,
  PilotId,
  Pilots,
  Player,
  startGBraverBurst,
} from "gbraver-burst-core";
import { BattleSDK } from "./battle-sdk";

/** ホスト側バトルSDK */
export class HostBattleSDK implements BattleSDK {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];

  /** Gブレイバーバーストコア */
  #core;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.hostArmdozerId ホスト側のアームドーザID
   * @param options.hostPilotId ホスト側のパイロットID
   * @param options.guestArmdozerId ゲスト側のアームドーザID
   * @param options.guestPilotId ゲスト側のパイロットID
   */
  constructor(options: {
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
    guestArmdozerId: ArmdozerId;
    guestPilotId: PilotId;
  }) {
    const hostPlayerId = nanoid();
    this.player = {
      playerId: hostPlayerId,
      armdozer:
        Armdozers.find((a) => a.id === options.hostArmdozerId) ?? Armdozers[0],
      pilot: Pilots.find((p) => p.id === options.hostPilotId) ?? Pilots[0],
    };

    const guestPlayerId = nanoid();
    this.enemy = {
      playerId: guestPlayerId,
      armdozer:
        Armdozers.find((a) => a.id === options.guestArmdozerId) ?? Armdozers[0],
      pilot: Pilots.find((p) => p.id === options.guestPilotId) ?? Pilots[0],
    };

    this.#core = startGBraverBurst([this.player, this.enemy]);
    this.initialState = this.#core.stateHistory();
  }
}
