import type { BattleSDK } from "@gbraver-burst-network/browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

/** プレイヤー01が選択するアームドーザ */
export const PLAYER_01_ARMDOZER = ArmdozerIds.SHIN_BRAVER;

/** プレイヤー01が選択するパイロット */
export const PLAYER_01_PILOT = PilotIds.SHINYA;

/** プレイヤー01側のバトルを進行する */
export const executePlayer01Battle = async (battle: BattleSDK) => {
  const update01 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update01);
  const update02 = await battle.progress({
    type: "BURST_COMMAND",
  });
  console.log(update02);
  const update03 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update03);
  const update04 = await battle.progress({
    type: "PILOT_SKILL_COMMAND",
  });
  console.log(update04);
  const update05 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update05);
};
