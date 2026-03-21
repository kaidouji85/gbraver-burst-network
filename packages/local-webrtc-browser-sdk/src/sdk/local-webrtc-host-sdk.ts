import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { Observable } from "rxjs";

import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { createRoom } from "../ws-signal/create-room";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";
import { LocalWebRTCRoom, LocalWebRTCRoomImpl } from "./local-webrtc-room";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCホスト用SDK */
export type LocalWebRTCHostSDK = {
  /**
   * ルームを生成する
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
   * WebRTCコネクションを切断する
   */
  disconnectWebRTC(): void;
};

/** ローカルWebRTCホスト用SDKの実装 */
class LocalWebRTCHostSDKImpl implements LocalWebRTCHostSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#websocketConnection = new WebSocketConnectionManager(wsSignalUrl);
    this.#webRTCConnection = new HostWebRTCConnectionManager();
  }

  /** @override */
  async createRoom() {
    try {
      const { connection } = this.#webRTCConnection.getOrCreateConnection();
      const sdp = await connection.createOffer();
      const [iceCandidates] = await Promise.all([
        // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
        waitUntilIceCandidate(connection),
        connection.setLocalDescription(sdp),
      ]);

      const websocket = await this.#websocketConnection.getOrCreate();
      const roomID = await createRoom({ websocket, sdp, iceCandidates });
      if (roomID === null) {
        this.#websocketConnection.gracefulDisconnect();
        return null;
      }

      return new LocalWebRTCRoomImpl({
        roomID,
        webRTCConnection: this.#webRTCConnection,
        websocketConnection: this.#websocketConnection,
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
  disconnectWebRTC() {
    this.#webRTCConnection.disconnect();
  }
}

/**
 * ローカルWebRTCホスト用SDKを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCホスト用SDKのインスタンス
 */
export function createLocalWebRTCHostSDK(
  wsSignalUrl: string,
): LocalWebRTCHostSDK {
  return new LocalWebRTCHostSDKImpl(wsSignalUrl);
}
