import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { Observable } from "rxjs";

import { createAbortError } from "../../abort-controller/abort-error";
import { AbortManager } from "../../abort-controller/abort-manager";
import { sendGuestMessage } from "../../webrtc/guest/guest-message";
import { guestPingPongCheck } from "../../webrtc/guest/guest-ping-pong-check";
import { receiveBattleStart } from "../../webrtc/guest/receive-battle-start";
import { receiveRequestSelectedPlayer } from "../../webrtc/guest/receive-request-selected-player";
import { joinRoom } from "../../websocket-api/join-room";
import { waitUntilSDPReceive } from "../../websocket-api/wait-until-sdp-recieve";
import { AnonymousBattleSDK } from "../anonymous-battle-sdk";
import { FrontendLogManager } from "../frontend-log-manager";
import { WebSocketConnectionManager } from "../websocket-connection-manager";
import { GuestBattleSDK } from "./guest-battle-sdk";
import {
  GuestWebRTCConnectionManager,
  GuestWebRTCConnectionManagerOptions,
} from "./guest-webrtc-connection-manager";
import { signaling } from "./signaling";

/** ゲスト用匿名バックエンドSDK */
export type GuestAnonymousSDK = {
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
  }) => Promise<AnonymousBattleSDK | null>;

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
type GuestAnonymousSDKImplOptions = GuestWebRTCConnectionManagerOptions & {
  /** WebSocketシグナルサーバーのURL */
  wsSignalUrl: string;
  /** 匿名バックエンドREST APIのURL */
  anonymousBackendApiURL: string;
};

/** ゲスト用匿名バックエンドSDKの実装 */
class GuestAnonymousSDKImpl implements GuestAnonymousSDK {
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: GuestWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;
  /** フロントエンドログマネージャー */
  #frontendLog: FrontendLogManager;
  /** アボート管理オブジェクト */
  #abortManager: AbortManager;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   */
  constructor(options: GuestAnonymousSDKImplOptions) {
    this.#webRTCConnection = new GuestWebRTCConnectionManager(options);
    this.#websocketConnection = new WebSocketConnectionManager(options);
    this.#frontendLog = new FrontendLogManager(options);
    this.#abortManager = new AbortManager();
  }

  /** @override */
  async joinRoom(options: {
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  }) {
    try {
      const { signal } = this.#abortManager.getAbortController();
      if (signal.aborted) {
        return Promise.reject(signal.reason);
      }

      const spanId = nanoid();
      const { roomID, armdozerId, pilotId } = options;
      this.#websocketConnection.gracefulDisconnect();
      this.#webRTCConnection.disconnect();

      const { connectionPromise, dataChannelPromise } =
        this.#webRTCConnection.getOrCreateConnection();
      const [websocket, connection] = await Promise.all([
        this.#websocketConnection.getOrCreate(),
        connectionPromise,
      ]);

      // 相手からのメッセージを待つものは、イベントの取りこぼしを防ぐためにあらかじめリスナーを登録する
      const joinRoomPromise = joinRoom({ websocket, roomID, signal });
      const pingPongPromise = dataChannelPromise.then((dataChannel) =>
        guestPingPongCheck({ dataChannel, signal }),
      );
      const receiveRequestSelectedPlayerPromise = dataChannelPromise.then(
        (dataChannel) => receiveRequestSelectedPlayer({ dataChannel, signal }),
      );
      const waitSDPRecievePromise = waitUntilSDPReceive({ websocket, signal });
      const revcieveBattleStartPromise = dataChannelPromise.then(
        (dataChannel) => receiveBattleStart({ dataChannel, signal }),
      );

      const joinRoomAccepted = await joinRoomPromise;
      if (!joinRoomAccepted) {
        return null;
      }

      const { signalingID } = joinRoomAccepted;
      const remoteSDP = await waitSDPRecievePromise;
      await signaling({
        signalingID,
        spanId,
        remoteSDP,
        frontendLog: this.#frontendLog,
        websocket,
        connection,
        signal,
      });
      const [dataChannel] = await Promise.all([
        dataChannelPromise,
        pingPongPromise,
      ]);
      this.#websocketConnection.gracefulDisconnect();

      const { flowID } = await receiveRequestSelectedPlayerPromise;
      sendGuestMessage(dataChannel, {
        type: "send-player",
        flowID,
        armdozerId,
        pilotId,
      });
      const battleStart = await revcieveBattleStartPromise;
      return new GuestBattleSDK({
        hostPlayer: battleStart.hostPlayer,
        guestPlayer: battleStart.guestPlayer,
        initialState: battleStart.update,
        initialFlowID: battleStart.flowID,
        webRTCConnection: this.#webRTCConnection,
        abortManager: this.#abortManager,
      });
    } catch (e) {
      this.#websocketConnection.gracefulDisconnect();
      throw e;
    }
  }

  /** @override */
  websocketErrorNotifier(): Observable<unknown> {
    return this.#websocketConnection.errorNotifier();
  }

  /** @override */
  disconnectWebSocket(): void {
    this.#websocketConnection.gracefulDisconnect();
    this.#abortManager
      .getAbortController()
      .abort(createAbortError("WebSocket disconnected"));
  }

  /** @override */
  disconnectWebRTC() {
    this.#webRTCConnection.disconnect();
    this.#abortManager
      .getAbortController()
      .abort(createAbortError("WebRTC disconnected"));
  }
}

/** GuestAnonymousSDKを生成するオプション */
type CreateGuestAnonymousSDKOptions = GuestAnonymousSDKImplOptions;

/**
 * ゲスト用匿名バックエンドSDKを生成する
 * @param options オプション
 * @returns ゲスト用匿名バックエンドSDKのインスタンス
 */
export function createGuestAnonymousSDK(
  options: CreateGuestAnonymousSDKOptions,
): GuestAnonymousSDK {
  return new GuestAnonymousSDKImpl(options);
}
