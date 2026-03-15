import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { connectWSSignal } from "../ws-signal/connect-ws-signal";
import { createRoom } from "../ws-signal/create-room";

/** ローカルWebRTC ルーム */
export type LocalWebRTCRoom = {
  /** ルームID */
  readonly roomID: string;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<void>;
};

/** ローカルWebRTCホスト用SDK */
export type LocalWebRTCHostSDK = {
  /**
   * ルームを生成する
   * @returns 生成されたルーム、生成に失敗した場合はnull
   */
  createRoom: () => Promise<LocalWebRTCRoom | null>;
};

/** ローカルWebRTCルームの実装 */
class LocalWebRTCRoomImpl implements LocalWebRTCRoom {
  roomID: string;
  #connection: RTCPeerConnection;
  #websocket: WebSocket;

  /**
   * コンストラクタ
   * @param roomID ルームID
   * @param connection RTCPeerConnectionのインスタンス
   * @param websocket WebSocketのインスタンス
   */
  constructor(
    roomID: string,
    connection: RTCPeerConnection,
    websocket: WebSocket,
  ) {
    this.roomID = roomID;
    this.#connection = connection;
    this.#websocket = websocket;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<void> {
    // TODO マッチングの実装
  }
}

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
    if (roomID === null) {
      return null;
    }

    return new LocalWebRTCRoomImpl(roomID, connection, websocket);
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
