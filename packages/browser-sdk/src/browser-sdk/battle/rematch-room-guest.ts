import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { rematchMakingGuest } from "../../websocket/rematch-making-guest";
import { BattleSDK, RematchRoom } from "./battle";
import { createBattleSDKFromBattleStart } from "./create-battle-sdk-from-battle-start";

/** 再戦ルーム（ゲスト側） */
export class RematchRoomGuest implements RematchRoom {
  /** websocketクライアント */
  readonly #websocket: WebSocket;
  /** 再戦ルームID */
  readonly #roomID: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.websocket WebSocketクライアント
   * @param options.roomID 再戦ルームID
   */
  constructor(options: { websocket: WebSocket; roomID: string }) {
    this.#websocket = options.websocket;
    this.#roomID = options.roomID;
  }

  /** @override */
  async requestRematch(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<BattleSDK> {
    const battleStart = await rematchMakingGuest({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
    });
    return createBattleSDKFromBattleStart(battleStart, this.#websocket);
  }
}
