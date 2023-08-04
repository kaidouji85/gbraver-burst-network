import { restoreGbraverBurst } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { BattleCommand } from "./core/battle-command";
import { canProgressBattle } from "./core/can-battle-progress";
import { None } from "./core/connection";
import { createPlayerCommands } from "./core/create-player-commands";
import { createPlayers } from "./core/create-players";
import { createBattleCommands } from "./dynamo-db/create-battle-commands";
import { createBattles } from "./dynamo-db/create-battles";
import { createConnections } from "./dynamo-db/create-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseBattleProgressPolling } from "./request/battle-progress-polling";
import type {
  BattleEnd,
  BattleProgressed,
  Error,
  NotReadyBattleProgress,
} from "./response/websocket-response";

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
const connections = createConnections(dynamoDB, SERVICE, STAGE);
/** battles テーブル DAO */
const battles = createBattles(dynamoDB, SERVICE, STAGE);
/** battle-commands テーブル DAO */
const battleCommands = createBattleCommands(dynamoDB, SERVICE, STAGE);

/** WebSocketAPI レスポンス 不正なリクエストボディ */
const webSocketAPIResponseOfInvalidRequestBody = {
  statusCode: 400,
  body: "invalid request body",
};
/** WebSocketAPI レスポンス コマンド入力が完了していない */
const webSocketAPIResponseOfNotReadyBattleProgress = {
  statusCode: 200,
  body: "not-ready-battle-progress",
};
/** WebSocketAPI レスポンス コマンド送信成功 */
const webSocketAPIResponseOfSendCommandSuccess = {
  statusCode: 200,
  body: "send command success",
};

/** クライアント通知 不正なリクエストボディ */
const invalidRequestError: Error = {
  action: "error",
  error: "invalid request body",
};
/** クライアント通知 コマンド入力が完了していない */
const notReadyBattleProgress: NotReadyBattleProgress = {
  action: "not-ready-battle-progress",
};

/**
 * バトル更新用のポーリング
 * プレイヤーのコマンドが揃っている場合はバトルを進め、
 * そうでない場合は何もしない
 * @param event イベント
 * @return 本関数が終了したら発火するPromise
 */
export async function battleProgressPolling(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseBattleProgressPolling(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestError,
    );
    return webSocketAPIResponseOfInvalidRequestBody;
  }

  const battle = await battles.get(data.battleID);
  if (!battle) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      notReadyBattleProgress,
    );
    return webSocketAPIResponseOfNotReadyBattleProgress;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const isPoller = user.userID === battle.poller;
  if (!isPoller) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      notReadyBattleProgress,
    );
    return webSocketAPIResponseOfNotReadyBattleProgress;
  }

  const fetchedCommands = await Promise.all([
    battleCommands.get(battle.players[0].userID),
    battleCommands.get(battle.players[1].userID),
  ]);
  if (!fetchedCommands[0] || !fetchedCommands[1]) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      notReadyBattleProgress,
    );
    return webSocketAPIResponseOfNotReadyBattleProgress;
  }

  const commands: [BattleCommand, BattleCommand] = [
    fetchedCommands[0],
    fetchedCommands[1],
  ];
  if (!canProgressBattle(data, battle, commands)) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      notReadyBattleProgress,
    );
    return webSocketAPIResponseOfNotReadyBattleProgress;
  }

  const corePlayers = createPlayers(battle);
  const coreCommands = createPlayerCommands(battle, commands);
  if (!coreCommands) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      notReadyBattleProgress,
    );
    return webSocketAPIResponseOfNotReadyBattleProgress;
  }

  const core = restoreGbraverBurst({
    players: corePlayers,
    stateHistory: battle.stateHistory,
  });
  const update = core.progress(coreCommands);

  const onGameEnd = () => {
    const noticedData: BattleEnd = {
      action: "battle-end",
      update,
    };
    const updatedConnectionState: None = {
      type: "None",
    };
    return Promise.all([
      ...battle.players.map((v) =>
        notifier.notifyToClient(v.connectionId, noticedData),
      ),
      ...battle.players.map((v) =>
        connections.put({
          connectionId: v.connectionId,
          userID: v.userID,
          state: updatedConnectionState,
        }),
      ),
      battles.delete(battle.battleID),
    ]);
  };

  const onGameContinue = () => {
    const flowID = uuidv4();
    const noticedData: BattleProgressed = {
      action: "battle-progressed",
      flowID,
      update,
    };
    return Promise.all([
      ...battle.players.map((v) =>
        notifier.notifyToClient(v.connectionId, noticedData),
      ),
      battles.put({ ...battle, flowID, stateHistory: core.stateHistory() }),
    ]);
  };

  const lastState = update[update.length - 1];
  const isGameEnd = lastState.effect.name === "GameEnd";
  await (isGameEnd ? onGameEnd() : onGameContinue());
  return webSocketAPIResponseOfSendCommandSuccess;
}
