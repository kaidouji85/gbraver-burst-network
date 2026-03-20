import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { createRoom } from "../ws-signal/create-room";
import { LocalWebRTCRoom, LocalWebRTCRoomImpl } from "./local-web-rtc-room";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCホスト用SDK */
export type LocalWebRTCHostSDK = {
  /**
   * ルームを生成する
   * @returns 生成されたルーム、生成に失敗した場合はnull
   */
  createRoom: () => Promise<LocalWebRTCRoom | null>;
};

/** ローカルWebRTCホスト用SDKの実装 */
class LocalWebRTCHostSDKImpl implements LocalWebRTCHostSDK {
  /** WebSocketコネクションマネージャー */
  #websocketManager: WebSocketConnectionManager;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#websocketManager = new WebSocketConnectionManager(wsSignalUrl);
  }

  /** @override */
  async createRoom() {
    const connection = new RTCPeerConnection();
    connection.createDataChannel("sendDataChannel");
    const sdp = await connection.createOffer();
    const [iceCandidates] = await Promise.all([
      // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
      waitUntilIceCandidate(connection),
      connection.setLocalDescription(sdp),
    ]);

    const websocket = await this.#websocketManager.getOrCreate();
    const roomID = await createRoom({ websocket, sdp, iceCandidates });
    if (roomID === null) {
      this.#websocketManager.gracefulDisconnect();
      return null;
    }

    return new LocalWebRTCRoomImpl({
      roomID,
      websocketManager: this.#websocketManager,
      connection,
    });
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
