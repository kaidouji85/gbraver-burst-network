import * as dotenv from "dotenv";
import * as fs from "fs";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { BattlePlayer } from "./core/battle";
import { casualMatchMake } from "./core/casual-match-make";
import { InBattle } from "./core/connection";
import { createBattle } from "./core/create-battle";
import { createBattlePlayer } from "./core/create-battle-player";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoCasualMatchEntries } from "./dynamo-db/create-dynamo-casual-match-entries";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
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
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBDocument(AWS_REGION);
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
const dynamoCasualMatchEntries = createDynamoCasualMatchEntries(dynamoDB, SERVICE, STAGE);
const casualMatchEntryScanLimit = 100;
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
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
const healthCheckFilePath = "match-make-health-check";

/**
 * ヘルスチェック用のファイルを作成する
 * @return 処理完了後に発火するPromise
 */
async function createHeathCheckFile(): Promise<void> {
  await fs.promises.writeFile(healthCheckFilePath, "ok");
}

/**
 * カジュアルマッチでマッチングがないかを探す
 * @return 処理完了後に発火するPromise
 */
async function matchMakingPolling(): Promise<void> {
  const entries = await dynamoCasualMatchEntries.scan(casualMatchEntryScanLimit);
  const matchingList = casualMatchMake(entries);
  const startBattles = matchingList.map(async (matching): Promise<void> => {
    const players: [BattlePlayer, BattlePlayer] = [
      createBattlePlayer(matching[0]),
      createBattlePlayer(matching[1]),
    ];
    const battle = createBattle(players);
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
      return {
        connectionId: entry.connectionId,
        data,
      };
    });
    const deleteEntryIDs = matching.map((v) => v.userID);
    await Promise.all([
      dynamoBattles.put(battle),
      ...updatedConnections.map((v) => dynamoConnections.put(v)),
      ...deleteEntryIDs.map((v) => dynamoCasualMatchEntries.delete(v)),
      ...notices.map((v) => notifier.notifyToClient(v.connectionId, v.data)),
    ]);
  });
  await Promise.all(startBattles);
}

/** エントリポイント */
(async () => {
  console.log(`${new Date().toString()} start`);
  await createHeathCheckFile();
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

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  process.exit(0);
});
