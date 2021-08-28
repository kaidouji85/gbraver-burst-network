// @flow

import {v4 as uuidv4} from 'uuid';
import {ArmDozers, Pilots, startGbraverBurst} from "gbraver-burst-core";
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";
import {matchMake} from "./match-make/match-make";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {Notifier} from "./api-gateway/notifier";
import {Battles} from "./dynamo-db/battles";
import {toPlayer} from "./dto/battle";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';
const BATTLES = process.env.BATTLES ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);
const battles = new Battles(dynamoDB, BATTLES);

/**
 * カジュアルマッチエントリテーブルをポーリングする
 *
 * @return 処理完了後に発火するPromise
 */
export async function pollingCasualMatchEntries(): Promise<void> {
  const entries = await casualMatchEntries.scan();
  const matchingList = matchMake(entries);
  const startBattles = matchingList.map(async (matching): Promise<void> => {
    const playerList = matching.map(entry => {
      const armdozer = ArmDozers.find(v => v.id === entry.armdozerId) ?? ArmDozers[0];
      const pilot = Pilots.find(v => v.id === entry.pilotId) ?? Pilots[0];
      return {playerId: uuidv4(), userID: entry.userID, armdozer, pilot};
    });
    const players = [playerList[0], playerList[1]];
    const core = startGbraverBurst(players);
    const battle = {battleID: uuidv4(), flowID: uuidv4(), stateHistory: core.stateHistory(), players};
    const updatedConnections = matching.map(v => {
      const state = {type: 'InBattle', battleID: battle.battleID};
      return {connectionId: v.connectionId, userID: v.userID, state};
    });
    const notices = matching.map(entry => {
      const player = players.find(v => v.userID === entry.userID) ?? players[0];
      const respPlayer = toPlayer(player);
      const enemy = players.find(v => v.userID !== entry.userID) ?? players[0];
      const respEnemy = toPlayer(enemy);
      const data = {
        action: 'start-battle', player: respPlayer, enemy: respEnemy,
        battleID: battle.battleID, flowID: battle.flowID
      };
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