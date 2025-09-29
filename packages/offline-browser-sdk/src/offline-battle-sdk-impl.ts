import { Command, GameState, Player } from "gbraver-burst-core";
import { fromEvent, Observable } from "rxjs";
import { Socket } from "socket.io-client";

import { OfflineBattleSDK } from "./offline-battle-sdk";
import { BattleInfo } from "./offline-browser-sdk";
import { GameEndedSchema } from "./socket-io-events/game-ended";
import { ProgressedSchema } from "./socket-io-events/progressed";

/** オフライン用バトルSDK実装 */
export class OfflineBattleSDKImpl implements OfflineBattleSDK {
  /** @override */
  player: Player;
  /** @override */
  enemy: Player;
  /** @override */
  initialState: GameState[];

  /** ソケット */
  #socket: Socket;
  /** フローID */
  #flowId: string;

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(
    options: BattleInfo & {
      /** 入室したソケット */
      socket: Socket;
    },
  ) {
    const enemy = options.stateHistory
      .at(-1)
      ?.players.find((p) => p.playerId !== options.player.playerId);
    if (!enemy) {
      throw new Error("Enemy player not found");
    }
    this.player = options.player;
    this.enemy = enemy;
    this.initialState = options.stateHistory;
    this.#socket = options.socket;
    this.#flowId = options.flowId;
  }

  /** @override */
  progress(command: Command): Promise<GameState[]> {
    this.#socket.emit("sendCommand", { command, flowId: this.#flowId });
    return new Promise<GameState[]>((resolve) => {
      this.#socket.once("progressed", (data) => {
        const parsedResult = ProgressedSchema.safeParse(data);
        if (!parsedResult.success) {
          return;
        }

        this.#flowId = parsedResult.data.flowId;
        resolve(parsedResult.data.updatedStateHistory);
      });

      this.#socket.once("gameEnded", (data) => {
        const parsedResult = GameEndedSchema.safeParse(data);
        if (!parsedResult.success) {
          return;
        }
        resolve(parsedResult.data.updatedStateHistory);
      });
    });
  }

  /** @override */
  suddenlyBattleEndNotifier(): Observable<unknown> {
    return fromEvent(this.#socket, "error");
  }
}
