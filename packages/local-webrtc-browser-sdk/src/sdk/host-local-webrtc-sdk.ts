import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { Observable } from "rxjs";

import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { createRoom } from "../websocket/create-room";
import {
  HostWebRTCConnectionManager,
  HostWebRTCConnectionManagerOptions,
} from "./host-webrtc-connection-manager";
import { LocalWebRTCRoom, LocalWebRTCRoomImpl } from "./local-webrtc-room";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCホスト用SDK */
export type HostLocalWebRTCSDK = {
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

/** LocalWebRTCHostSDKImplコンストラクタのオプション */
type LocalWebRTCHostSDKImplOptions = HostWebRTCConnectionManagerOptions & {
  /** WebSocketシグナルサーバーのURL */
  wsSignalUrl: string;
};

/** ローカルWebRTCホスト用SDKの実装 */
class HostLocalWebRTCSDKImpl implements HostLocalWebRTCSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   */
  constructor(options: LocalWebRTCHostSDKImplOptions) {
    this.#websocketConnection = new WebSocketConnectionManager(options);
    this.#webRTCConnection = new HostWebRTCConnectionManager(options);
  }

  /** @override */
  async createRoom(options: {
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }): Promise<LocalWebRTCRoom | null> {
    const spanId = nanoid();
    try {
      console.log(`${spanId} CREATE_ROOM_START`);

      this.#websocketConnection.gracefulDisconnect();
      this.#webRTCConnection.disconnect();

      const connection =
        await this.#webRTCConnection.getOrCreateConnection().connectionPromise;
      const sdp = await connection.createOffer();

      console.log(`${spanId} HOST_ICE_CANDIDATE_START`);
      const [iceCandidates] = await Promise.all([
        // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
        waitUntilIceCandidate(connection),
        connection.setLocalDescription(sdp),
      ]);
      console.log(`${spanId} HOST_ICE_CANDIDATE_END`);

      const websocket = await this.#websocketConnection.getOrCreate();
      const roomID = await createRoom({ websocket, sdp, iceCandidates });
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
        hostArmdozerId,
        hostPilotId,
      });
    } catch (e) {
      this.#websocketConnection.gracefulDisconnect();
      throw e;
    } finally {
      console.log(`${spanId} CREATE_ROOM_END`);
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

/** LocalWebRTCHostSDKを生成するオプション */
type CreateLocalWebRTCHostSDKOptions = LocalWebRTCHostSDKImplOptions;

/**
 * ローカルWebRTCホスト用SDKを生成する
 * @param options SDK生成のオプション
 * @returns ローカルWebRTCホスト用SDKのインスタンス
 */
export function createHostLocalWebRTCSDK(
  options: CreateLocalWebRTCHostSDKOptions,
): HostLocalWebRTCSDK {
  return new HostLocalWebRTCSDKImpl(options);
}
