import { ArmdozerIds, Armdozers, PilotIds, Pilots } from "gbraver-burst-core";

import { createOfflineBrowserSDK } from "./";

/** バックエンドURL */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/**
 * アームドーザの選択肢を更新する
 */
const updateArmdozerOptions = () => {
  const armdozerSelect = document.getElementById(
    "armdozer",
  ) as HTMLSelectElement;
  Armdozers.forEach((armdozer) => {
    const option = document.createElement("option");
    option.value = armdozer.id;
    option.text = armdozer.name;
    armdozerSelect.appendChild(option);
  });
};

/**
 * パイロットの選択肢を更新する
 */
const updatePilotOptions = () => {
  const pilotSelect = document.getElementById("pilot") as HTMLSelectElement;
  Pilots.forEach((pilot) => {
    const option = document.createElement("option");
    option.value = pilot.id;
    option.text = pilot.name;
    pilotSelect.appendChild(option);
  });
};

/** スタブのエントリポイント */
window.onload = () => {
  updateArmdozerOptions();
  updatePilotOptions();

  const sdk = createOfflineBrowserSDK({ backendURL: BACKEND_URL });
  sdk.enterRoom({
    armdozerId: ArmdozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  });
};
