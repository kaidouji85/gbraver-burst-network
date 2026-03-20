import { Observable } from "rxjs";

import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { joinRoom } from "../ws-signal/join-room";
import { sendGuestSignal } from "../ws-signal/send-guest-signal";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCゲスト用SDK */
export type LocalWebRTCGuestSDK = {
  /**
   * ルームに参加する
   * @param roomID ルームID
   * @returns ルームへの参加に成功したらtrue、失敗したらfalse
   */
  joinRoom: (roomID: string) => Promise<boolean>;

  /**
   * WebSocketのエラーを通知する
   * @returns 通知ストリーム
   */
  websocketErrorNotifier(): Observable<unknown>;
};

/** ローカルWebRTCゲスト用SDKの実装 */
class LocalWebRTCGuestSDKImpl implements LocalWebRTCGuestSDK {
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
  async joinRoom(roomID: string) {
    try {
      const websocket = await this.#websocketManager.getOrCreate();
      const joinRoomAccepted = await joinRoom({ websocket, roomID });
      if (!joinRoomAccepted) {
        return false;
      }

      const { sdp: hostSDP, iceCandidates: hostIceCandidates } =
        joinRoomAccepted;
      const connection = new RTCPeerConnection();
      await connection.setRemoteDescription(hostSDP);
      await Promise.all(
        hostIceCandidates.map((c) => connection.addIceCandidate(c)),
      );
      const guestSDP = await connection.createAnswer();
      const [guestIceCandidates] = await Promise.all([
        // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
        waitUntilIceCandidate(connection),
        connection.setLocalDescription(guestSDP),
      ]);
      const { reservationID } = joinRoomAccepted;
      await Promise.all([
        sendGuestSignal({
          websocket,
          roomID,
          reservationID,
          sdp: guestSDP,
          iceCandidates: guestIceCandidates,
        }),
        waitUntilConnected(connection),
      ]);
      return true;
    } finally {
      this.#websocketManager.gracefulDisconnect();
    }
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketManager.errorNotifier();
  }
}

/**
 * ローカルWebRTCゲスト用SDKを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCゲスト用SDKのインスタンス
 */
export function createLocalWebRTCGuestSDK(
  wsSignalUrl: string,
): LocalWebRTCGuestSDK {
  return new LocalWebRTCGuestSDKImpl(wsSignalUrl);
}
