import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { Observable } from "rxjs";

import { createRoom } from "../websocket-api/create-room";
import { FrontendLogManager } from "./frontend-log-manager";
import {
  HostWebRTCConnectionManager,
  HostWebRTCConnectionManagerOptions,
} from "./host-webrtc-connection-manager";
import { LocalWebRTCRoom, LocalWebRTCRoomImpl } from "./local-webrtc-room";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ホスト用匿名バックエンドSDK */
export type HostAnonymousSDK = {
  /**
   * ルームを生成する
   * 本メソッドでは新しいWebRTCコネクションを生成し、シグナリングも行うため、
   * 既存のWebRTCコネクションやシグナリングは本メソッド内で切断される
   * @param options ルーム生成のオプション
   * @param options.armdozerId ホストが選択したアームドーザのID
   * @param options.pilotId ホストが選択したパイロットのID
   * @returns 生成されたルーム、生成に失敗した場合はnull
   */
  createRoom: (options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) => Promise<LocalWebRTCRoom | null>;

  /**
   * WebSocketのエラーを通知する
   * @returns 通知ストリーム
   */
  websocketErrorNotifier(): Observable<unknown>;

  /**
   * WebSocketコネクションを切断する
   * シグナリングの際に自動的に接続・切断されるが、
   * シグナリングをキャンセルする場合に本メソッドを呼び出す
   */
  disconnectWebSocket(): void;

  /**
   * WebRTCコネクションを切断する
   * 利用側で明示的に本メソッドを呼ばない限り、WebRTCコネクションは切断されない
   */
  disconnectWebRTC(): void;
};

/** HostAnonymousSDKImplコンストラクタのオプション */
type HostAnonymousSDKImplOptions = HostWebRTCConnectionManagerOptions & {
  /** WebSocketシグナルサーバーのURL */
  wsSignalUrl: string;
};

/** ホスト用匿名バックエンドSDKの実装 */
class HostAnonymousSDKImpl implements HostAnonymousSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;
  /** フロントエンドログマネージャー */
  #frontendLog: FrontendLogManager;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   */
  constructor(options: HostAnonymousSDKImplOptions) {
    this.#websocketConnection = new WebSocketConnectionManager(options);
    this.#webRTCConnection = new HostWebRTCConnectionManager(options);
    this.#frontendLog = new FrontendLogManager(options);
  }

  /** @override */
  async createRoom(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<LocalWebRTCRoom | null> {
    const spanId = nanoid();
    try {
      this.#websocketConnection.gracefulDisconnect();
      this.#webRTCConnection.disconnect();

      const websocket = await this.#websocketConnection.getOrCreate();
      const roomID = await createRoom(websocket);
      if (roomID === null) {
        this.#websocketConnection.gracefulDisconnect();
        return null;
      }

      const { armdozerId: hostArmdozerId, pilotId: hostPilotId } = options;
      return new LocalWebRTCRoomImpl({
        roomID,
        spanId,
        webRTCConnection: this.#webRTCConnection,
        websocketConnection: this.#websocketConnection,
        frontendLog: this.#frontendLog,
        hostArmdozerId,
        hostPilotId,
      });
    } catch (e) {
      this.#websocketConnection.gracefulDisconnect();
      throw e;
    }
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketConnection.errorNotifier();
  }

  /** @override */
  disconnectWebSocket() {
    this.#websocketConnection.gracefulDisconnect();
  }

  /** @override */
  disconnectWebRTC() {
    this.#webRTCConnection.disconnect();
  }
}

/** HostAnonymousSDKを生成するオプション */
type CreateHostAnonymousSDKOptions = HostAnonymousSDKImplOptions;

/**
 * ホスト用匿名バックエンドSDKを生成する
 * @param options SDK生成のオプション
 * @returns ホスト用匿名バックエンドSDKのインスタンス
 */
export function createHostAnonymousSDK(
  options: CreateHostAnonymousSDKOptions,
): HostAnonymousSDK {
  return new HostAnonymousSDKImpl(options);
}
