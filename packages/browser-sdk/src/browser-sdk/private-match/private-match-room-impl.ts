import { AbortManager } from "../../abort-controller/abort-manager";
import { privateMatchMakePolling } from "../../websocket/private-match-make-polling";
import { BattleSDK } from "../battle/battle";
import { createBattleSDKFromBattleStart } from "../battle/create-battle-sdk-from-battle-start";
import { PrivateMatchRoom, PrivateMatchRoomID } from "./private-match";

/** プライベートマッチルームの実装 */
export class PrivateMatchRoomImpl implements PrivateMatchRoom {
  /** @override */
  roomID: PrivateMatchRoomID;
  /** websocketクライアント */
  #websocket: WebSocket;
  /** websocket用のAbortManager */
  #websocketAbortManager: AbortManager;

  /**
   * コンストラクタ
   * @param roomID ルームID
   * @param websocket websocketクライアント
   * @param websocketAbortManager websocket用のAbortManager
   */
  constructor(
    roomID: PrivateMatchRoomID,
    websocket: WebSocket,
    websocketAbortManager: AbortManager,
  ) {
    this.roomID = roomID;
    this.#websocket = websocket;
    this.#websocketAbortManager = websocketAbortManager;
  }

  /** @override */
  async waitUntilMatching(): Promise<BattleSDK> {
    const { signal } = this.#websocketAbortManager.getAbortController();
    const resp = await privateMatchMakePolling(this.#websocket, this.roomID, {
      signal,
    });
    return createBattleSDKFromBattleStart(
      resp,
      this.#websocket,
      this.#websocketAbortManager,
    );
  }
}
