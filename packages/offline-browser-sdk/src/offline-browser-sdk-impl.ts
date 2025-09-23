import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { io, Socket } from "socket.io-client";

import { OfflineBrowserSDK } from "./offline-browser-sdk";

/** オフライン用ブラウザSDK実装 */
export class OfflineBrowserSDKImpl implements OfflineBrowserSDK {
  /** バックエンドURL */
  #backendURL: string;
  /** ソケット接続、未作成の場合はnull */
  #socket: Socket | null = null;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.backendURL バックエンドURL
   */
  constructor(options: { backendURL: string }) {
    this.#backendURL = options.backendURL;
  }

  /** @override */
  async enterRoom(options: { armdozerId: ArmdozerId; pilotId: PilotId }) {
    const socket = this.#ensureSocket();
    socket.emit("enterRoom", options);
    return new Promise<void>((resolve) => {
      socket.once("matched", () => {
        resolve();
      });
    });
  }

  /**
   * ソケットの存在を保証する（未作成なら作成する）
   * @returns ソケット
   */
  #ensureSocket(): Socket {
    this.#socket = this.#socket ?? io(this.#backendURL);
    return this.#socket;
  }
}
