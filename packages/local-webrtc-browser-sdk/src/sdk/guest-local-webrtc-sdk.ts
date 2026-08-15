import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { Observable } from "rxjs";

import { gatherAllIceCandidates } from "../webrtc/gather-all-ice-candidate";
import { sendGuestMessage } from "../webrtc/guest/guest-message";
import { receiveBattleStart } from "../webrtc/guest/receive-battle-start";
import { receiveRequestSelectedPlayer } from "../webrtc/guest/receive-request-selected-player";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { joinRoom } from "../websocket-api/join-room";
import { sendGuestSignal } from "../websocket-api/send-guest-signal";
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

    try {
      this.#websocketConnection.gracefulDisconnect();
      this.#webRTCConnection.disconnect();

      const requestSelectedPlayerPromise = (async () => {
        const dataChannel =
          await this.#webRTCConnection.getOrCreateConnection()
            .dataChannelPromise;
        return await receiveRequestSelectedPlayer(dataChannel);
      })();
      const battleStartPromise = (async () => {
        const dataChannel =
          await this.#webRTCConnection.getOrCreateConnection()
            .dataChannelPromise;
        return await receiveBattleStart(dataChannel);
      })();

      const isSignalingSuccessful = await this.#signaling({ roomID, spanId });
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
    } finally {
      this.#websocketConnection.gracefulDisconnect();
    }
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
   * @param options.roomID ルームID
   * @param options.spanId ログ用の識別子
   * @returns シグナリングが完了したらtrue、失敗したらfalse
   */
  async #signaling(options: {
    roomID: string;
    spanId: string;
  }): Promise<boolean> {
    const { roomID, spanId } = options;
    const websocket = await this.#websocketConnection.getOrCreate();
    const joinRoomAccepted = await joinRoom({ websocket, roomID });
    if (!joinRoomAccepted) {
      return false;
    }

    const { sdp: hostSDP, iceCandidates: hostIceCandidates } = joinRoomAccepted;
    const connection =
      await this.#webRTCConnection.getOrCreateConnection().connectionPromise;
    await connection.setRemoteDescription(hostSDP);
    await Promise.all(
      hostIceCandidates.map((c) => connection.addIceCandidate(c)),
    );
    const guestSDP = await connection.createAnswer();

    await this.#frontendLog.log({ type: "ICE_CANDIDATE_START", spanId });
    const [guestIceCandidates] = await Promise.all([
      // icecandidateイベントはsetLocalDescriptionの後に発生するため、先に待機しておく
      gatherAllIceCandidates(connection),
      connection.setLocalDescription(guestSDP),
    ]);
    await this.#frontendLog.log({ type: "ICE_CANDIDATE_END", spanId });

    await this.#frontendLog.log({ type: "SIGNALING_START", spanId });
    const { reservationID } = joinRoomAccepted;
    await Promise.all([
      sendGuestSignal({
        websocket,
        roomID,
        reservationID,
        sdp: guestSDP,
        iceCandidates: guestIceCandidates.iceCandidates,
      }),
      waitUntilConnected(connection),
      ...guestIceCandidates.iceCandidateErrors.map((error) =>
        this.#frontendLog.log({ type: "ICE_CANDIDATE_ERROR", spanId, error }),
      ),
    ]);
    await this.#frontendLog.log({ type: "SIGNALING_END", spanId });
    return true;
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
