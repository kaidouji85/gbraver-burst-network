import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { fromEvent, Observable, Unsubscribable } from "rxjs";

import { createICECandidateErrorMessage } from "../webrtc/gather-all-ice-candidate";
import { getSelectedIceCandidateSummary } from "../webrtc/get-selected-ice-candidate-summary";
import { sendGuestMessage } from "../webrtc/guest/guest-message";
import { receiveBattleStart } from "../webrtc/guest/receive-battle-start";
import { receiveRequestSelectedPlayer } from "../webrtc/guest/receive-request-selected-player";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { joinRoom } from "../websocket-api/join-room";
import { notifyIceCandidateReceived } from "../websocket-api/notify-ice-candidate-recieved";
import { sendToWSSignal } from "../websocket-api/send-to-ws-signal";
import { waitUntilSDPReceive } from "../websocket-api/wait-until-sdp-recieve";
import { BattleSDK } from "./battle-sdk";
import { FrontendLogManager } from "./frontend-log-manager";
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
  /** WebRTCヘルパーAPIのURL */
  webRTCHelperApiURL: string;
};

/** ローカルWebRTCゲスト用SDKの実装 */
class GuestLocalWebRTCSDKImpl implements GuestLocalWebRTCSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: GuestWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;
  /** フロントエンドログマネージャー */
  #frontendLog: FrontendLogManager;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   */
  constructor(options: LocalWebRTCGuestSDKImplOptions) {
    this.#webRTCConnection = new GuestWebRTCConnectionManager(options);
    this.#websocketConnection = new WebSocketConnectionManager(options);
    this.#frontendLog = new FrontendLogManager(options);
  }

  /** @override */
  async joinRoom(options: {
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) {
    const spanId = nanoid();
    const { roomID, armdozerId, pilotId } = options;
    this.#websocketConnection.gracefulDisconnect();
    this.#webRTCConnection.disconnect();

    // イベントを取り逃がさないように、あらかじめハンドラをセットしておく
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

    const websocket = await this.#websocketConnection.getOrCreate();
    const joinRoomAccepted = await joinRoom({ websocket, roomID });
    if (!joinRoomAccepted) {
      return null;
    }

    const { signalingID } = joinRoomAccepted;
    await this.#signaling({ signalingID, spanId });

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
   * @param options シグナリングのオプション
   * @param options.signalingID シグナリングID
   * @param options.spanId ログ用の識別子
   * @returns シグナリングが完了したら発火するPromise
   */
  async #signaling(options: {
    signalingID: string;
    spanId: string;
  }): Promise<void> {
    const { signalingID, spanId } = options;
    let unSubscribers: Unsubscribable[] = [];

    try {
      await this.#frontendLog.log({
        type: "SIGNALING_START",
        spanId,
      });

      const websocket = await this.#websocketConnection.getOrCreate();
      const { connectionPromise } =
        this.#webRTCConnection.getOrCreateConnection();
      const connection = await connectionPromise;

      let isRemoteDescriptionSet = false;
      const pendingIceCandidates: RTCIceCandidateInit[] = [];

      // イベントを取り逃がさないように、あらかじめハンドラをセットしておく
      unSubscribers = [
        notifyIceCandidateReceived(websocket).subscribe((iceCandidate) => {
          if (isRemoteDescriptionSet) {
            connection.addIceCandidate(iceCandidate);
          } else {
            pendingIceCandidates.push(iceCandidate);
          }
        }),
        fromEvent<RTCPeerConnectionIceEvent>(
          connection,
          "icecandidate",
        ).subscribe((event) => {
          if (event.candidate) {
            sendToWSSignal(websocket, {
              action: "send-ice-candidate",
              signalingID,
              iceCandidate: event.candidate,
            });
          }
        }),
        fromEvent<RTCPeerConnectionIceErrorEvent>(
          connection,
          "icecandidateerror",
        ).subscribe((event) => {
          this.#frontendLog.log({
            type: "ICE_CANDIDATE_ERROR",
            spanId,
            error: createICECandidateErrorMessage(event),
          });
        }),
      ];

      const remoteSDP = await waitUntilSDPReceive(websocket);
      await connection.setRemoteDescription(remoteSDP);
      isRemoteDescriptionSet = true;
      pendingIceCandidates.forEach((iceCandidate) => {
        connection.addIceCandidate(iceCandidate);
      });
      const sdp = await connection.createAnswer();
      await connection.setLocalDescription(sdp);
      sendToWSSignal(websocket, {
        action: "send-sdp",
        signalingID,
        sdp,
      });
      await waitUntilConnected(connection);

      await this.#frontendLog.log({
        type: "SIGNALING_END",
        spanId,
      });

      const selectedLocalIceCandidateSummary =
        await getSelectedIceCandidateSummary(connection);
      if (selectedLocalIceCandidateSummary !== null) {
        await this.#frontendLog.log({
          type: "SELECTED_ICE_CANDIDATE_SUMMARY",
          spanId,
          summary: selectedLocalIceCandidateSummary,
        });
      }
    } finally {
      this.#websocketConnection.gracefulDisconnect();
      unSubscribers.forEach((unSubscriber) => unSubscriber.unsubscribe());
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
export function createGuestLocalWebRTCSDK(
  options: CreateLocalWebRTCGuestSDKOptions,
): GuestLocalWebRTCSDK {
  return new GuestLocalWebRTCSDKImpl(options);
}
