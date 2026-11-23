import { AnonymousBattleSDK } from "@gbraver-burst-network/anonymous-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { waitTime } from "../../wait-time";

/** ゲストのアームドーザ */
export const GUEST_ARMDOZER = ArmdozerIds.NEO_LANDOZER;

/** ゲストのパイロット */
export const GUEST_PILOT = PilotIds.GAI;

/**
 * ゲスト側のバトルを実施するヘルパーメソッド
 * @param battle バトルSDK
 * @returns バトル進行が完了したら発火するPromise
 */
export const executeGuestBattle = async (battle: AnonymousBattleSDK) => {
  const update01 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 3,
  });
  console.log(update01);
  await waitTime(1000);
  const update02 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update02);
  await waitTime(1000);
  const update03 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update03);
  await waitTime(1000);
  const update04 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 0,
  });
  console.log(update04);
  await waitTime(1000);
  const update05 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 0,
  });
  console.log(update05);
  await waitTime(1000);
};
