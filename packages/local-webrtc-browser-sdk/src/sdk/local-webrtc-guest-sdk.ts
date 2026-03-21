import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { Observable } from "rxjs";

import { sendGuestMessage } from "../webrtc/guest/guest-message";
import { receiveBattleStart } from "../webrtc/guest/receive-battle-start";
import { receiveRequestSelectedPlayer } from "../webrtc/guest/receive-request-selected-player";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilIceCandidate } from "../webrtc/wait-untilIce-candidate";
import { joinRoom } from "../ws-signal/join-room";
import { sendGuestSignal } from "../ws-signal/send-guest-signal";
import { BattleSDK } from "./battle-sdk";
import { GuestBattleSDK } from "./guest-battle-sdk";
import { GuestWebRTCConnectionManager } from "./guest-webrtc-connection-manager";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCゲスト用SDK */
export type LocalWebRTCGuestSDK = {
  /**
   * ルームに参加する
   * @param options ルーム参加のオプション
   * @param options.roomID ルームID
   * @param options.armdozerId ゲストが選択したアームドーザのID
   * @param options.pilotId ゲストが選択したパイロットのID
   * @returns ルームへの参加に成功したらBattleSDK、失敗したらnull
   */
  joinRoom: (options: {
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) => Promise<BattleSDK | null>;

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

/** ローカルWebRTCゲスト用SDKの実装 */
class LocalWebRTCGuestSDKImpl implements LocalWebRTCGuestSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: GuestWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#webRTCConnection = new GuestWebRTCConnectionManager();
    this.#websocketConnection = new WebSocketConnectionManager(wsSignalUrl);
  }

  /** @override */
  async joinRoom(options: {
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) {
    const { roomID, armdozerId, pilotId } = options;

    const requestSelectedPlayerPromise = (async () => {
      const dataChannel =
        await this.#webRTCConnection.getOrCreateConnection().dataChannel;
      return await receiveRequestSelectedPlayer(dataChannel);
    })();
    const battleStartPromise = (async () => {
      const dataChannel =
        await this.#webRTCConnection.getOrCreateConnection().dataChannel;
      return await receiveBattleStart(dataChannel);
    })();

    const isSignalingSuccessful = await this.#signaling(roomID);
    if (!isSignalingSuccessful) {
      return null;
    }

    const { flowID } = await requestSelectedPlayerPromise;
    const dataChannel =
      await this.#webRTCConnection.getOrCreateConnection().dataChannel;
    sendGuestMessage(dataChannel, {
      type: "send-player",
      flowID,
      armdozerId,
      pilotId,
    });
    const battleStart = await battleStartPromise;
    return new GuestBattleSDK({
      hostPlayer: battleStart.hostPlayer,
      guestPlayer: battleStart.guestPlayer,
      initialState: battleStart.update,
      initialFlowID: battleStart.flowID,
      webRTCConnection: this.#webRTCConnection,
    });
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketConnection.errorNotifier();
  }

  /** @override */
  disconnectWebRTC() {
    this.#webRTCConnection.disconnect();
  }

  /**
   * シグナリングを行う
   * @param roomID ルームID
   * @returns シグナリングが完了したら発火するPromise
   */
  async #signaling(roomID: string) {
    try {
      const websocket = await this.#websocketConnection.getOrCreate();
      const joinRoomAccepted = await joinRoom({ websocket, roomID });
      if (!joinRoomAccepted) {
        return false;
      }

      const { sdp: hostSDP, iceCandidates: hostIceCandidates } =
        joinRoomAccepted;
      const { connection } = this.#webRTCConnection.getOrCreateConnection();
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
      this.#websocketConnection.gracefulDisconnect();
    }
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
