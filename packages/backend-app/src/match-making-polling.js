// @flow

import * as dotenv from "dotenv";
import { startGbraverBurst } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { matchMake } from "./core/match-make";
import type { BattlesSchema } from "./dynamo-db/battles";
import { createDynamoDBClient } from "./dynamo-db/client";
import type { InBattle } from "./dynamo-db/connections";
import { createPlayerSchema } from "./dynamo-db/create-player-schema";
import {
  createBattles,
  createCasualMatchEntries,
  createConnections,
} from "./dynamo-db/dao-creator";
import { createBattleStart } from "./response/create-battle-start";
import { wait } from "./wait/wait";

dotenv.config();

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const casualMatchEntries = createCasualMatchEntries(dynamoDB, SERVICE, STAGE);
const casualMatchEntryScanLimit = 100;
const battles = createBattles(dynamoDB, SERVICE, STAGE);
const intervalInMillisecond = 3000;
// コンテナ起動から1日経過したら停止したい
//   1日 = 86400秒
//   ポーリング間隔 = 3秒
// これより
//     1日 / ポーリング間隔
//   = 86400 / 3
//   = 28800回
// ポーリングしたら1日経過している
const maxPollingCount = 28800;

(async () => {
  for (let i = 0; i < maxPollingCount; i++) {
    i % 30 === 0 && console.log(`${new Date().toString()} polling`);
    const start = Date.now();
    await matchMakingPolling();
    const end = Date.now();
    const executeTime = end - start;
    const waitTime = Math.max(intervalInMillisecond - executeTime, 1000);
    await wait(waitTime);
  }
  console.log(`${new Date().toString()} end`);
})();

/**
 * カジュアルマッチでマッチングがないかを探す
 * @return 処理完了後に発火するPromise
 */
async function matchMakingPolling(): Promise<void> {
  const entries = await casualMatchEntries.scan(casualMatchEntryScanLimit);
  const matchingList = matchMake(entries);
  const startBattles = matchingList.map(async (matching): Promise<void> => {
    const players = [
      createPlayerSchema(matching[0]),
      createPlayerSchema(matching[1]),
    ];
    const core = startGbraverBurst(players);
    const poller = players[0].userID;
    const battle: BattlesSchema = {
      battleID: uuidv4(),
      flowID: uuidv4(),
      stateHistory: core.stateHistory(),
      players,
      poller,
    };
    const updatedConnectionState: InBattle = {
      type: "InBattle",
      battleID: battle.battleID,
      players,
    };
    const updatedConnections = matching.map((v) => ({
      connectionId: v.connectionId,
      userID: v.userID,
      state: updatedConnectionState,
    }));
    const notices = matching.map((entry) => {
      const data = createBattleStart(entry.userID, battle);
      return { connectionId: entry.connectionId, data };
    });
    const deleteEntryIDs = matching.map((v) => v.userID);
    await Promise.all([
      battles.put(battle),
      ...updatedConnections.map((v) => connections.put(v)),
      ...deleteEntryIDs.map((v) => casualMatchEntries.delete(v)),
      ...notices.map((v) => notifier.notifyToClient(v.connectionId, v.data)),
    ]);
  });
  await Promise.all(startBattles);
}
