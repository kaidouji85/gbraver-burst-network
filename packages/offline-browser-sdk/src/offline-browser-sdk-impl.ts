import { ArmdozerId, Command, PilotId } from "gbraver-burst-core";
import { Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";

import {
  BattleInfo,
  BattleInfoSchema,
  GameProgressResult,
  GameProgressResultSchema,
  OfflineBrowserSDK,
} from "./offline-browser-sdk";

/** オフライン用ブラウザSDK実装 */
export class OfflineBrowserSDKImpl implements OfflineBrowserSDK {
  /** バックエンドURL */
  #backendURL: string;
  /** ソケット接続、未作成の場合はnull */
  #socket: Socket | null = null;
  /** 現在のフローID、バトル以外ではnullがセットされる */
  #flowId: string | null = null;
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
  }): Promise<BattleInfo> {
    const socket = this.#ensureSocket();
    socket.emit("enterRoom", options);
    return new Promise<BattleInfo>((resolve) => {
      socket.once("matched", (data) => {
        const parsedBattleInfo = BattleInfoSchema.safeParse(data);
        if (parsedBattleInfo.success) {
          this.#flowId = parsedBattleInfo.data.flowId;
          resolve(parsedBattleInfo.data);
        }
      });
    });
  }

  /** @override */
  async sendCommand(command: Command): Promise<GameProgressResult> {
    if (!this.#flowId) {
      throw new Error("Not in battle");
    }

    const socket = this.#ensureSocket();
    socket.emit("sendCommand", { command, flowId: this.#flowId });
    return new Promise<GameProgressResult>((resolve) => {
      socket.once("progressed", (data) => {
        const parsedResult = GameProgressResultSchema.safeParse(data);
        if (parsedResult.success) {
          this.#flowId = parsedResult.data.flowId;
          resolve(parsedResult.data);
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
    this.#flowId = null;
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
