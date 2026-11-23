import { AnonymousBattleSDK } from "@gbraver-burst-network/anonymous-browser-sdk";
import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { waitTime } from "../../wait-time";

/** ホスト側アームドーザ */
export const HOST_ARMDOZER = ArmdozerIds.SHIN_BRAVER;

/** ホスト側パイロット */
export const HOST_PILOT = PilotIds.SHINYA;

/**
 * バトルを実施するヘルパーメソッド
 * 本メソッドではバトル終了確認をしていないが、
 * バトル終了になるようにゲーム進行することを確認している
 * @param battle バトルSDK
 * @returns バトルが完了したら発火するPromise
 */
export const executeHostBattle = async (battle: AnonymousBattleSDK) => {
  const update01 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update01);
  await waitTime(1000);
  const update02 = await battle.progress({
    type: "BURST_COMMAND",
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
    type: "PILOT_SKILL_COMMAND",
  });
  console.log(update04);
  await waitTime(1000);
  const update05 = await battle.progress({
    type: "BATTERY_COMMAND",
    battery: 5,
  });
  console.log(update05);
};
