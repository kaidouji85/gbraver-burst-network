import { ArmdozerIds, Armdozers, EMPTY_PLAYER } from "gbraver-burst-core";
import { startGBraverBurst } from "gbraver-burst-core/lib/src/game";

import { Battle, BattlePlayer } from "../../../src/core/battle";
import { BattleCommand } from "../../../src/core/battle-command";
import { progressBattle } from "../../../src/core/progress-battle";

/** プレイヤー01 */
const player01: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "player01",
  userID: "userid-01",
  connectionId: "player01-connection",
  armdozer:
    Armdozers.find((armdozer) => armdozer.id === ArmdozerIds.NEO_LANDOZER) ??
    Armdozers[0],
};

/** プレイヤー02 */
const player02: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "player02",
  userID: "userid-02",
  connectionId: "player02-connection",
  armdozer:
    Armdozers.find((armdozer) => armdozer.id === ArmdozerIds.SHIN_BRAVER) ??
    Armdozers[0],
};

/** バトル情報 */
const battle: Battle<BattlePlayer> = {
  battleID: "test-battle",
  flowID: "test-flow",
  players: [player01, player02],
  poller: player01.userID,
  stateHistory: startGBraverBurst([player01, player02]).stateHistory(),
};

/** プレイヤー01 コマンド */
const player01Command: BattleCommand = {
  userID: player01.userID,
  battleID: battle.battleID,
  flowID: battle.flowID,
  command: {
    type: "BATTERY_COMMAND",
    battery: 3,
  },
};

/** プレイヤー02 コマンド */
const player02Command: BattleCommand = {
  userID: player02.userID,
  battleID: battle.battleID,
  flowID: battle.flowID,
  command: {
    type: "BATTERY_COMMAND",
    battery: 3,
  },
};

test("バトルを正しく進めることができる", () => {
  expect(
    progressBattle(battle, [player01Command, player02Command]),
  ).toMatchSnapshot();
});
