import type { BattleSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

/** プレイヤー02が選択するアームドーザ */
export const PLAYER_02_ARMDOZER = ArmdozerIds.NEO_LANDOZER;

/** プレイヤー02が選択するパイロット */
export const PLAYER_02_PILOT = PilotIds.GAI;

/** プレイヤー02側のバトルを進行する */
export const executePlayer02Battle = async (battle: BattleSDK) => {
  const update01 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 3,
  });
  console.log(update01);
  const update02 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update02);
  const update03 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update03);
  const update04 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 0,
  });
  console.log(update04);
  const update05 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 0,
  });
  console.log(update05);
};
