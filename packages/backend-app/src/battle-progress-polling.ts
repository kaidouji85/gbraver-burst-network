import { DynamoBattleCommandsFetcher } from "./adapter/dynamo-battle-commands-fetcher";
import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { BattleCommandsFetcher } from "./core/battle-commands-fetcher";
import { canProgressBattle } from "./core/can-battle-progress";
import {
  BattleContinue,
  BattleEnd,
  progressBattle,
} from "./core/progress-battle";
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
 * @returns websocket apiに返すデータ
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
 * @returns websocket apiに返すデータ
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

/**
 * 「ゲーム終了」でAPIを終了する
 * @param battleEnd バトル終了情報
 * @returns websocket apiに返すデータ
 */
async function endWithGameEnd(
  battleEnd: BattleEnd,
): Promise<WebsocketAPIResponse> {
  const { update, connections, endBattleID } = battleEnd;
  const notifiers = connections.map(
    (v) =>
      ({
        connectionId: v.connectionId,
        data: {
          action: "battle-end",
          update,
        },
      }) as const,
  );
  await Promise.all([
    ...notifiers.map((v) => notifier.notifyToClient(v.connectionId, v.data)),
    ...connections.map((v) => dynamoConnections.put(v)),
    dynamoBattles.delete(endBattleID),
  ]);
  return webSocketAPIResponseOfSendCommandSuccess;
}

/**
 * 「ゲーム継続」でAPIを終了する
 * @param battleContinue バトル継続情報
 * @returns websocket apiに返すデータ
 */
async function endWithGameContinue(
  battleContinue: BattleContinue,
): Promise<WebsocketAPIResponse> {
  const { battle, update } = battleContinue;
  const notifiers = battle.players.map(
    (v) =>
      ({
        connectionId: v.connectionId,
        data: {
          action: "battle-progressed",
          flowID: battle.flowID,
          update,
        },
      }) as const,
  );
  await Promise.all([
    ...notifiers.map((v) => notifier.notifyToClient(v.connectionId, v.data)),
    dynamoBattles.put(battle),
  ]);
  return webSocketAPIResponseOfSendCommandSuccess;
}

/**
 * バトル更新用のポーリング
 * プレイヤーのコマンドが揃っている場合はバトルを進め、
 * そうでない場合は何もしない
 * @param event イベント
 * @returns websocket apiに返すデータ
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

  const result = progressBattle(battle, commands);
  if (!result) {
    return await endWithNotReadyBattleProgress(event);
  }

  if (result.isGameEnd) {
    return await endWithGameEnd(result);
  }

  return await endWithGameContinue(result);
}
