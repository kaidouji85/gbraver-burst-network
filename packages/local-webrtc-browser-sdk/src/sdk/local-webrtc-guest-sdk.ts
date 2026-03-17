import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { connectWSSignal } from "../ws-signal/connect-ws-signal";
import { joinRoom } from "../ws-signal/join-room";
import { sendGuestSignal } from "../ws-signal/send-guest-signal";

/** ローカルWebRTCゲスト用SDK */
export type LocalWebRTCGuestSDK = {
  /**
   * ルームに参加する
   * @param roomID ルームID
   * @returns ルームへの参加に成功したらtrue、失敗したらfalse
   */
  joinRoom: (roomID: string) => Promise<boolean>;
};

/** ローカルWebRTCゲスト用SDKの実装 */
class LocalWebRTCGuestSDKImpl implements LocalWebRTCGuestSDK {
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
  async joinRoom(roomID: string) {
    const websocket = await connectWSSignal(this.#wsSignalUrl);
    const joinRoomAccepted = await joinRoom({ websocket, roomID });
    if (!joinRoomAccepted) {
      websocket.close();
      return false;
    }

    const { sdp: hostSDP, iceCandidates: hostIceCandidates } = joinRoomAccepted;
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
    return await sendGuestSignal({
      websocket,
      roomID,
      reservationID,
      sdp: guestSDP,
      iceCandidates: guestIceCandidates,
    });
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
