import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { connectWSSignal } from "../ws-signal/connect-ws-signal";
import { createRoom } from "../ws-signal/create-room";
import { LocalWebRTCRoom, LocalWebRTCRoomImpl } from "./local-web-rtc-room";

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
  /** WebSocketシグナルサーバーのURL */
  #wsSignalUrl: string;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#wsSignalUrl = wsSignalUrl;
  }

  /** @override */
  async createRoom() {
    let websocket: WebSocket | null = null;
    try {
      const connection = new RTCPeerConnection();
      connection.createDataChannel("sendDataChannel");
      const sdp = await connection.createOffer();
      const [iceCandidates] = await Promise.all([
        // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
        waitUntilIceCandidate(connection),
        connection.setLocalDescription(sdp),
      ]);

      websocket = await connectWSSignal(this.#wsSignalUrl);
      const roomID = await createRoom({ websocket, sdp, iceCandidates });
      if (roomID === null) {
        websocket.close();
        return null;
      }

      return new LocalWebRTCRoomImpl(roomID, websocket);
    } finally {
      if (websocket) {
        websocket.close();
      }
    }
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
