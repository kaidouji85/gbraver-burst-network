import { GameState } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { DynamoBattleCommandsFetcher } from "./adapter/dynamo-battle-commands-fetcher";
import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { Battle, BattlePlayer } from "./core/battle";
import { BattleCommandsFetcher } from "./core/battle-commands-fetcher";
import { canProgressBattle } from "./core/can-battle-progress";
import { None } from "./core/connection";
import { deprecatedProgressBattle } from "./core/deprecated-progress-battle";
import { createDynamoBattleCommands } from "./dynamo-db/create-dynamo-battle-commands";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { invalidRequestBody } from "./lambda/invalid-request-body";
import { notReadyBattleProgress as webSocketAPIResponseOfNotReadyBattleProgress } from "./lambda/not-ready-battle-progress";
import { sendCommandSuccess as webSocketAPIResponseOfSendCommandSuccess } from "./lambda/send-command-success";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseBattleProgressPolling } from "./request/battle-progress-polling";
import { invalidRequestBodyError } from "./response/invalid-request-body-error";
import { notReadyBattleProgress } from "./response/not-ready-battle-progress";
import { BattleEnd, BattleProgressed } from "./response/websocket-response";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** サービス名 */
const SERVICE = process.env.SERVICE ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** WebSocket API Gateway のID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

/** WebSocket API Gatewayエンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** WebSocket API Gateway 管理オブジェクト */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** クライアントへのメッセージ通知オブジェクト */
const notifier = new Notifier(apiGateway);

/** Dynamo DB ドキュメント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** connections テーブル DAO */
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
/** battles テーブル DAO */
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
/** battle-commands テーブル DAO */
const dynamoBattleCommands = createDynamoBattleCommands(
  dynamoDB,
  SERVICE,
  STAGE,
);

/** DynamoDBからゲーム参加プレイヤーのバトルコマンドを取得するポート */
const battleCommandsFetcher: BattleCommandsFetcher =
  new DynamoBattleCommandsFetcher(dynamoBattleCommands);

/**
 * 「リクエストボディが不正」でAPIを終了する
 * @param event イベント
 * @return websocket apiに返すデータ
 */
async function endWithInvalidRequestBody(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  await notifier.notifyToClient(
    event.requestContext.connectionId,
    invalidRequestBodyError,
  );
  return invalidRequestBody;
}

/**
 * 「コマンド入力が完了していない」でAPIを終了する
 * @param event イベント
 * @return websocket apiに返すデータ
 */
async function endWithNotReadyBattleProgress(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  await notifier.notifyToClient(
    event.requestContext.connectionId,
    notReadyBattleProgress,
  );
  return webSocketAPIResponseOfNotReadyBattleProgress;
}

/** ゲーム終了時処理のパラメータ */
type OnGameEndParams = {
  /** バトル情報 */
  battle: Battle<BattlePlayer>;
  /** 更新されたゲームステート */
  update: GameState[];
};

/**
 * ゲーム終了時の処理
 * @param params パラメータ
 * @return 処理が完了したら発火するPromise
 */
async function onGameEnd(params: OnGameEndParams): Promise<void> {
  const { battle, update } = params;
  const noticedData: BattleEnd = {
    action: "battle-end",
    update,
  };
  const updatedConnectionState: None = {
    type: "None",
  };
  await Promise.all([
    ...battle.players.map((v) =>
      notifier.notifyToClient(v.connectionId, noticedData),
    ),
    ...battle.players.map((v) =>
      dynamoConnections.put({
        connectionId: v.connectionId,
        userID: v.userID,
        state: updatedConnectionState,
      }),
    ),
    dynamoBattles.delete(battle.battleID),
  ]);
}

/** ゲーム継続時処理のパラメータ */
type OnGameContinueParams = {
  /** バトル情報 */
  battle: Battle<BattlePlayer>;
  /** 更新されたゲームステート */
  update: GameState[];
  /** 今まで蓄積されたすべてのゲームステート */
  stateHistory: GameState[];
};

/**
 * ゲーム継続時の処理
 * @param params パラメータ
 * @return 処理が完了したら発火するPromise
 */
async function onGameContinue(params: OnGameContinueParams): Promise<void> {
  const { battle, update, stateHistory } = params;
  const flowID = uuidv4();
  const noticedData: BattleProgressed = {
    action: "battle-progressed",
    flowID,
    update,
  };
  await Promise.all([
    ...battle.players.map((v) =>
      notifier.notifyToClient(v.connectionId, noticedData),
    ),
    dynamoBattles.put({ ...battle, flowID, stateHistory }),
  ]);
}

/**
 * バトル更新用のポーリング
 * プレイヤーのコマンドが揃っている場合はバトルを進め、
 * そうでない場合は何もしない
 * @param event イベント
 * @return websocket apiに返すデータ
 */
export async function battleProgressPolling(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseBattleProgressPolling(body);
  if (!data) {
    return await endWithInvalidRequestBody(event);
  }

  const battle = await dynamoBattles.get(data.battleID);
  if (!battle) {
    return await endWithNotReadyBattleProgress(event);
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const isNotPoller = user.userID !== battle.poller;
  if (isNotPoller) {
    return await endWithNotReadyBattleProgress(event);
  }

  const commands = await battleCommandsFetcher.fetch(battle.players);
  if (!commands) {
    return await endWithNotReadyBattleProgress(event);
  }

  if (!canProgressBattle(data, battle, commands)) {
    return await endWithNotReadyBattleProgress(event);
  }

  const result = deprecatedProgressBattle(battle, commands);
  if (!result) {
    return await endWithNotReadyBattleProgress(event);
  }

  const { update, stateHistory, isGameEnd } = result;
  await (isGameEnd
    ? onGameEnd({ battle, update })
    : onGameContinue({ battle, update, stateHistory }));
  return webSocketAPIResponseOfSendCommandSuccess;
}
