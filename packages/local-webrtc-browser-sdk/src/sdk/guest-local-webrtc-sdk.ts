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
import {
  GuestWebRTCConnectionManager,
  GuestWebRTCConnectionManagerOptions,
} from "./guest-webrtc-connection-manager";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTCゲスト用SDK */
export type GuestLocalWebRTCSDK = {
  /**
   * ルームに参加する
   * 本メソッドでは新しいWebRTCコネクションを生成し、シグナリングも行うため、
   * 既存のWebRTCコネクションやシグナリングは本メソッド内で切断される
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

/** LocalWebRTCGuestSDKImplコンストラクタのオプション */
type LocalWebRTCGuestSDKImplOptions = GuestWebRTCConnectionManagerOptions & {
  /** WebSocketシグナルサーバーのURL */
  wsSignalUrl: string;
};

/** ローカルWebRTCゲスト用SDKの実装 */
class LocalWebRTCGuestSDKImpl implements GuestLocalWebRTCSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: GuestWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   */
  constructor(options: LocalWebRTCGuestSDKImplOptions) {
    this.#webRTCConnection = new GuestWebRTCConnectionManager(options);
    this.#websocketConnection = new WebSocketConnectionManager(options);
  }

  /** @override */
  async joinRoom(options: {
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) {
    const { roomID, armdozerId, pilotId } = options;

    this.#websocketConnection.gracefulDisconnect();
    this.#webRTCConnection.disconnect();

    const requestSelectedPlayerPromise = (async () => {
      const dataChannel =
        await this.#webRTCConnection.getOrCreateConnection().dataChannelPromise;
      return await receiveRequestSelectedPlayer(dataChannel);
    })();
    const battleStartPromise = (async () => {
      const dataChannel =
        await this.#webRTCConnection.getOrCreateConnection().dataChannelPromise;
      return await receiveBattleStart(dataChannel);
    })();

    const isSignalingSuccessful = await this.#signaling(roomID);
    if (!isSignalingSuccessful) {
      return null;
    }

    const { flowID } = await requestSelectedPlayerPromise;
    const dataChannel =
      await this.#webRTCConnection.getOrCreateConnection().dataChannelPromise;
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
  disconnectWebSocket(): void {
    this.#websocketConnection.gracefulDisconnect();
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
      const connection =
        await this.#webRTCConnection.getOrCreateConnection().connectionPromise;
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

/** LocalWebRTCGuestSDKを生成するオプション */
type CreateLocalWebRTCGuestSDKOptions = LocalWebRTCGuestSDKImplOptions;

/**
 * ローカルWebRTCゲスト用SDKを生成する
 * @param options オプション
 * @returns ローカルWebRTCゲスト用SDKのインスタンス
 */
export function createLocalWebRTCGuestSDK(
  options: CreateLocalWebRTCGuestSDKOptions,
): GuestLocalWebRTCSDK {
  return new LocalWebRTCGuestSDKImpl(options);
}
