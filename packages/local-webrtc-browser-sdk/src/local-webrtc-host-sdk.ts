import { waitUntilIceCandidate } from "./webrtc/wait-untilIce-candidate";
import { connectWSSignal } from "./ws-signal/connect-ws-signal";
import { createRoom } from "./ws-signal/create-room";

/** ローカルWebRTCホスト用SDK */
export type LocalWebRTCHostSDK = {
  /**
   * ルームを生成する
   * @returns 生成されたルームのID、生成に失敗した場合はnull
   */
  createRoom: () => Promise<string | null>;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<void>;
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
    const connection = new RTCPeerConnection();
    connection.createDataChannel("sendDataChannel");
    const sdp = await connection.createOffer();
    const [iceCandidates] = await Promise.all([
      // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
      waitUntilIceCandidate(connection),
      connection.setLocalDescription(sdp),
    ]);

    const websocket = await connectWSSignal(this.#wsSignalUrl);
    const roomID = await createRoom({ websocket, sdp, iceCandidates });
    websocket.close();
    return roomID;
  }

  /** @override */
  async waitUntilMatching() {
    // TODO ロジックを作る
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
