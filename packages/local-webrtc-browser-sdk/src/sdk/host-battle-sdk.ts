import {
  ArmdozerId,
  Armdozers,
  GameState,
  PilotId,
  Pilots,
  Player,
  startGBraverBurst,
} from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { EMPTY, Observable } from "rxjs";

import { BattleSDK } from "./battle-sdk";

/** ホスト側バトルSDK */
export class HostBattleSDK implements BattleSDK {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];
  /** 最新のフローID */
  flowID: string;
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

    this.flowID = nanoid();
  }

  /** @override */
  async progress(): Promise<GameState[]> {
    // TODO 中身を実装する
    return [];
  }

  /**
   * バトル強制終了の通知ストリーム
   * @returns 通知ストリーム
   */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    // TODO 中身を実装する
    return EMPTY;
  }
}
