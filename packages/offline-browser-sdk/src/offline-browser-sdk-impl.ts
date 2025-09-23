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
   * オプション
   * @param options オプション
   * @param options.backendURL バックエンドURL
   */
  constructor(options: { backendURL: string }) {
    this.#backendURL = options.backendURL;
  }

  /** @override */
  enterRoom(options: { armdozerId: ArmdozerId; pilotId: PilotId }): void {
    this.#ensureSocket().emit("enterRoom", options);
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
