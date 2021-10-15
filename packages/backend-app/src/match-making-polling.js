// @flow

import {v4 as uuidv4} from 'uuid';
import {ArmDozers, Pilots, startGbraverBurst} from "gbraver-burst-core";
import {createDynamoDBClient} from "./dynamo-db/client";
import type {InBattle} from './dynamo-db/connections';
import {createApiGatewayManagementApi} from "./api-gateway/management";
import type {CasualMatchEntriesSchema} from "./dynamo-db/casual-match-entries";
import {matchMake} from "./match-make/match-make";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {Notifier} from "./api-gateway/notifier";
import type {BattlesSchema, PlayerSchema} from "./dynamo-db/battles";
import {toPlayer} from "./core/battle";
import type {UserID} from "./core/user";
import type {BattleStart} from "./response/websocket-response";
import {wait} from "./wait/wait";
import {createBattles, createCasualMatchEntries, createConnections} from "./dynamo-db/dao-creator";
import {SERVICE} from "./sls/service";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const casualMatchEntries = createCasualMatchEntries(dynamoDB, SERVICE, STAGE);
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
  for(let i=0; i < maxPollingCount; i++) {
    console.log(`${new Date().toString()} polling`);
    const start = Date.now();
    await matchMakingPolling();
    const end = Date.now();
    const executeTime = end- start;
    const waitTime = Math.max(intervalInMillisecond - executeTime, 0);
    await wait(waitTime);
  }
})();

/**
 * カジュアルマッチでマッチングがないかを探す
 *
 * @return 処理完了後に発火するPromise
 */
async function matchMakingPolling(): Promise<void> {
  const entries = await casualMatchEntries.scan();
  const matchingList = matchMake(entries);
  const startBattles = matchingList.map(async (matching): Promise<void> => {
    const players = [createPlayerSchema(matching[0]), createPlayerSchema(matching[1])];
    const core = startGbraverBurst(players);
    const poller = players[0].userID;
    const battle: BattlesSchema = {battleID: uuidv4(), flowID: uuidv4(), 
      stateHistory: core.stateHistory(), players, poller};
    const updatedConnectionState: InBattle = {type: 'InBattle', battleID: battle.battleID, players};
    const updatedConnections = matching
      .map(v => ({connectionId: v.connectionId, userID: v.userID, state: updatedConnectionState}));
    const notices = matching.map(entry => {
      const data = createBattleStart(entry.userID, battle);
      return {connectionId: entry.connectionId, data};
    });
    const deleteEntryIDs = matching.map(v => v.userID);
    await Promise.all([
      battles.put(battle),
      ...updatedConnections.map(v => connections.put(v)),
      ...deleteEntryIDs.map(v => casualMatchEntries.delete(v)),
      ...notices.map(v => notifier.notifyToClient(v.connectionId, v.data))
    ]);
  });
  await Promise.all(startBattles);
}

/**
 * CasualMatchEntriesSchemaからPlayerSchemaを生成するヘルパー関数
 *
 * @param entry エントリ
 * @return 生成結果
 */
function createPlayerSchema(entry: CasualMatchEntriesSchema): PlayerSchema {
  const armdozer = ArmDozers.find(v => v.id === entry.armdozerId) ?? ArmDozers[0];
  const pilot = Pilots.find(v => v.id === entry.pilotId) ?? Pilots[0];
  return {playerId: uuidv4(), userID: entry.userID, connectionId: entry.connectionId, armdozer, pilot};
}

/**
 * 戦闘開始オブジェクトを生成するヘルパー関数
 *
 * @param userID 戦闘開始オブジェクトを受け取るユーザのID
 * @param battle バトル情報
 * @return 生成結果
 */
function createBattleStart(userID: UserID, battle: BattlesSchema): BattleStart {
  const player = battle.players.find(v => v.userID === userID) ?? battle.players[0];
  const respPlayer = toPlayer(player);
  const enemy = battle.players.find(v => v.userID !== userID) ?? battle.players[0];
  const respEnemy = toPlayer(enemy);
  const isPoller = userID === battle.poller;
  return {action: 'battle-start', player: respPlayer, enemy: respEnemy,
    battleID: battle.battleID, flowID: battle.flowID, stateHistory: battle.stateHistory, isPoller};
}