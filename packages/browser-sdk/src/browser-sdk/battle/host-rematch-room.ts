import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { BattleSDK, RematchRoom } from "./battle";
import { rematchMakingHost } from "../../websocket/rematch-making-host";
import { createBattleSDKFromBattleStart } from "./create-battle-sdk-from-battle-start";

/** 再戦ルーム（ホスト側） */
export class HostRematchRoom implements RematchRoom {
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
    const battleStart = await rematchMakingHost({
      websocket: this.#websocket,
      roomID: this.#roomID,
      armdozerId: options.armdozerId,
      pilotId: options.pilotId,
    });
    return createBattleSDKFromBattleStart(battleStart, this.#websocket);
  }
}
