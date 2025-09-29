import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";

import { OfflineBattleSDK } from "./offline-battle-sdk";
import { OfflineBattleSDKImpl } from "./offline-battle-sdk-impl";
import { BattleInfoSchema, OfflineBrowserSDK } from "./offline-browser-sdk";

/** オフライン用ブラウザSDK実装 */
export class OfflineBrowserSDKImpl implements OfflineBrowserSDK {
  /** バックエンドURL */
  #backendURL: string;
  /** ソケット接続、未作成の場合はnull */
  #socket: Socket | null = null;
  /** エラー通知のSubject */
  #error: Subject<unknown>;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.backendURL バックエンドURL
   */
  constructor(options: { backendURL: string }) {
    this.#backendURL = options.backendURL;
    this.#error = new Subject<unknown>();
  }

  /** @override */
  async enterRoom(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<OfflineBattleSDK> {
    const socket = this.#ensureSocket();
    socket.emit("enterRoom", options);
    return new Promise<OfflineBattleSDK>((resolve) => {
      socket.once("matched", (data) => {
        const parsedBattleInfo = BattleInfoSchema.safeParse(data);
        if (parsedBattleInfo.success) {
          const battleSDK = new OfflineBattleSDKImpl({
            ...parsedBattleInfo.data,
            socket,
          });
          resolve(battleSDK);
        }
      });
    });
  }

  /** @override */
  closeConnection(): void {
    if (!this.#socket) {
      return;
    }

    this.#socket.disconnect();
    this.#socket = null;
  }

  /** @override */
  notifyError(): Observable<unknown> {
    return this.#error;
  }

  /**
   * ソケットの存在を保証する（未作成なら作成する）
   * @returns ソケット
   */
  #ensureSocket(): Socket {
    if (this.#socket) {
      return this.#socket;
    }

    this.#socket = io(this.#backendURL);
    this.#socket.on("error", (err) => {
      this.#error.next(err);
    });
    return this.#socket;
  }
}
